import React from 'react';
import {
    Alert, List, Avatar, Row, Col, Form, message, Popconfirm,
    Empty, Button, Space, Modal, Input, Typography, Layout, Menu, Select,
} from "antd";
import { getStringToAvatarStyle } from "../utils/color";
import { SearchOutlined } from '@ant-design/icons';
import {escapeRegExp, fileBasename, sanitizeFilePath} from "../utils/strings";
import path from 'path-browserify';

const WorkSpaceSetting = React.forwardRef((props, ref) => {
    const [closable, setClosable] = React.useState(false);
    const [workSpace, setWorkSpace] = React.useState('');
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    const handleOk = React.useCallback(() => {
        window.DeerUtils.Global.Setting.Set('workspace', workSpace)
        setIsModalOpen(false);
    }, [workSpace, setIsModalOpen]);

    React.useImperativeHandle(ref, () => ({
        openDialog: (closable) => {
            setIsModalOpen(true);
            setClosable(closable);
        }
    }));

    const chooseWorkSpace = async () => {
        const rel = await window.DeerUtils.FS.OpenDialog({
            title: '选择工作目录',
            properties: [
                'openDirectory', 'createDirectory'
            ]
        });
        if (!rel.canceled) {
            setWorkSpace(rel.filePaths[0] || '');
        }
    }

    return <Modal
        title="设置工作目录"
        open={isModalOpen}
        mask={true}
        closeIcon={closable ? undefined : false}
        maskClosable={closable}
        keyboard={closable}
        onOk={handleOk}
        onCancel={() => {
            setIsModalOpen(false);
        }}
        cancelButtonProps={{
            disabled: !closable
        }}
    >
        <Typography.Paragraph>
            此目录用于存放题目项目数据，
        </Typography.Paragraph>
        <Space.Compact style={{ width: '100%' }}>
            <Input value={workSpace} readOnly />
            <Button type="default" onClick={chooseWorkSpace}>选择目录</Button>
        </Space.Compact>
    </Modal>
});

function WelcomePage() {
    const [tabKey, setTabKey] = React.useState('home');
    const [workSpace, setWorkSpace] = React.useState('');
    const [problemList, setProblemList] = React.useState([]);
    const [searchKey, setSearchKey] = React.useState('');
    const [deleteDgOpen, setDeleteDgOpen] = React.useState({});
    const [deleteOptLoading, setDeleteOptLoading] = React.useState(false);
    const [newProjectForm] = Form.useForm();
    const wssRef = React.useRef();

    const openWorkSpaceDialog = (closable) => {
        if (wssRef.current) {
            wssRef.current.openDialog(closable);
        }
    }

    const StoreListener = (event, nv) => {
        setWorkSpace(nv['workspace']);
    }

    React.useLayoutEffect(() => {
        window.DeerUtils.Global.Setting.Get('workspace').then((workDir) => {
            if (!workDir) {
                openWorkSpaceDialog(false)
            } else {
                window.DeerUtils.FS.Exists(workDir).then((existsRet) => {
                    if (!existsRet.exists) {
                        openWorkSpaceDialog(false);
                    } else {
                        setWorkSpace(workDir);
                    }
                });
            }
        });
        window.DeerUtils.Global.Setting.OnDidAnyChange(StoreListener)
        return () => {
            window.DeerUtils.Global.Setting.RemoveDidAnyChange(StoreListener)
        }
    }, []);

    const getProblemList = React.useCallback(async () => {
        if (!workSpace) return;
        const existsRet = await window.DeerUtils.FS.Exists(workSpace);
        if (existsRet.exists) {
            const problemDirs = await window.DeerUtils.FS.Walk(workSpace, 0);
            setProblemList(problemDirs.filter(item => item.is_dir))
        } else {
            openWorkSpaceDialog(false)
        }
    }, [workSpace]);

    const filteredProblemList = React.useMemo(() => {
        if (searchKey) {
            const reg = new RegExp(escapeRegExp(searchKey), 'gi');
            return problemList.filter((item) => reg.test(item.name));
        }
        return problemList;
    }, [problemList, searchKey]);

    const handleNewProjectSubmit = async (values) => {
        // 在workspace下创建一个新的题目

        const projectName = sanitizeFilePath(values.title.trim());
        if (!projectName) {
            message.error('题目名称为空，请重新输入');
            return false;
        }

        const projectDir = path.join(workSpace, projectName);

        const existsPDir = await window.DeerUtils.FS.Exists(projectDir);
        if (existsPDir.exists) {
            message.error('目录已存在，请使用其他名字');
            return false;
        }

        let sampleFile = '';
        if (tabKey === 'new') {
            sampleFile = path.join(await window.DeerUtils.Global.AppPath(), values.sample)
        } else if (tabKey === 'import') {
            sampleFile = values.packagePath;
            if (!sampleFile.trim()) {
                message.error('请选择要导入的题目包');
                return false;
            }
        }

        const existsSample = await window.DeerUtils.FS.Exists(sampleFile);
        if (!existsSample.exists) {
            message.error('题目包文件不存在：' + sampleFile);
            return false;
        }

        const ret = await window.DeerUtils.Shell.DeerExecutor.NewProblemProject(projectDir, sampleFile);
        if (ret.code === 0) {
            message.success('创建成功');
            newProjectForm.resetFields();
            setTabKey('home');
            // 刷新列表
            getProblemList().then(() => {});
        } else {
            message.error('创建失败：' + ret.message);
        }
    }

    const menuItems = [
        { label: '开始', key: 'home' },
        { label: '新建题目', key: 'new'},
        { label: '导入题目', key: 'import' },
    ]

    const chooseProblemPackage = async () => {
        const rel = await window.DeerUtils.FS.OpenDialog({
            title: '选择要导入的题目包文件',
            properties: [
                'openFile'
            ]
        });
        if (!rel.canceled) {
            const file = String(rel.filePaths[0] || '');
            newProjectForm.setFieldsValue({
                'packagePath': file,
                'title': fileBasename(file)
            });
        }
    }

    const handleDeleteConfirmOpen = React.useCallback((item) => {
        setDeleteDgOpen({
            [item.name]: true,  // 排他
        })
    }, [setDeleteDgOpen])

    const handleDeleteProject = async(item) => {
        setDeleteDgOpen({});
        const projectDir = path.join(workSpace, item.name);
        const existsPDir = await window.DeerUtils.FS.Exists(projectDir);
        if (!existsPDir.exists) {
            message.error('目录不存在');
            getProblemList().then(() => {}); // 刷新列表
            return false;
        }
        try {
            await window.DeerUtils.FS.Delete(projectDir);
            message.success('删除成功');
            getProblemList().then(() => {}); // 刷新列表
        } catch(e) {
            message.error('删除失败：' + e);
        } finally {
            getProblemList().then(() => {}); // 刷新列表
        }
    }

    // == effect
    React.useEffect(() => {
        document.title = 'Deer Editor 欢迎页'
    }, []);
    React.useEffect( () => {
        if (workSpace) {
            getProblemList().then(() => {});
        }
    }, [workSpace, getProblemList])

    React.useEffect(() => {
        if (newProjectForm) {
            newProjectForm.resetFields();
        }
        if (tabKey === "home") {
            // 刷新列表
            getProblemList().then(() => {
            });
        }
    }, [tabKey, newProjectForm])

    return <>
        <Layout className="deer-editor-main-layout">
            <Row gutter={16} style={{ background: "#001529" }} justify="space-between">
                <Col>
                    <Menu
                        theme="dark"
                        mode="horizontal"
                        selectedKeys={[tabKey]}
                        items={menuItems}
                        onSelect={({ key }) => {
                            setTabKey(key);
                        }}
                    />
                </Col>
                <Col style={{marginRight: 16}}>
                    <Input
                        style={{ marginTop: 8 }}
                        prefix={<SearchOutlined />}
                        placeholder="请输入要搜索的题目名称"
                        value={searchKey}
                        onChange={(e) => setSearchKey(e.target.value)}
                    />
                </Col>
            </Row>
            {tabKey === 'home' && <Alert
                banner
                type="info"
                message={<Row gutter={16}>
                    <Col span={20}>
                        <Typography.Text ellipsis>当前工作目录：{workSpace}</Typography.Text>
                    </Col>
                    <Col span={4} style={{ textAlign: 'right' }}>
                        <Typography.Link onClick={() => openWorkSpaceDialog(true)}>[更改]</Typography.Link>
                    </Col>
                </Row>}
            />}
            {tabKey === 'home' && <Layout.Content className="deer-editor-main-layout-content">
                {!problemList.length ? <Empty
                    style={{ marginTop: 100 }}
                    description={<Typography.Text strong>欢迎使用deer-executor编辑器</Typography.Text>}
                >
                    请先新建或者导入一个题目
                </Empty> : (filteredProblemList.length ? <div className="deer-editor-scroll-layout">
                    <List
                        style={{ margin: 16 }}
                        itemLayout="horizontal"
                        dataSource={filteredProblemList}
                        renderItem={(item) => (
                            <List.Item>
                                <List.Item.Meta
                                    avatar={<Avatar style={getStringToAvatarStyle(item.name)}>{item.name[0]}</Avatar>}
                                    title={<Typography.Link>{item.name}</Typography.Link>}
                                    description={item.path}
                                />
                                <Space>
                                    <Button size="small" type="primary">打包</Button>
                                    <Popconfirm
                                        title="危险"
                                        description="确定要删除这个题目吗？操作不可恢复！"
                                        open={deleteDgOpen[item.name]}
                                        onConfirm={() => handleDeleteProject(item)}
                                        okButtonProps={{ loading: deleteOptLoading }}
                                        onCancel={() => { setDeleteDgOpen({})}}
                                    >
                                        <Button size="small" type="primary" danger onClick={() => handleDeleteConfirmOpen(item)}>删除</Button>
                                    </Popconfirm>
                                </Space>
                            </List.Item>
                        )}
                    />
                </div> : <Empty
                    style={{ marginTop: 100 }}
                    description={<Typography.Text strong>未能找到"{searchKey}"相关题目</Typography.Text>}
                />)}
            </Layout.Content>}
            {(tabKey === "new" || tabKey === "import")&& <Layout.Content>
                <Form
                    form={newProjectForm}
                    className="new-project-layout"
                    style={{ maxWidth: 440, marginTop: 100 }}
                    initialValues={{
                        title: '',
                        sample: '',
                        packagePath: ''
                    }}
                    onFinish={handleNewProjectSubmit}
                >
                    {tabKey === "import" && <Form.Item label="题目包路径">
                        <Space.Compact style={{ width: '100%' }}>
                            <Form.Item noStyle name="packagePath">
                                <Input readOnly />
                            </Form.Item>
                            <Button type="default" onClick={chooseProblemPackage}>选择题目包</Button>
                        </Space.Compact>
                    </Form.Item>}
                    <Form.Item label="题目名称" name="title">
                        <Input />
                    </Form.Item>
                    {tabKey === "new" && <Form.Item label="使用模板" name="sample">
                        <Select>
                            <Select.Option value="">不使用</Select.Option>
                            <Select.Option value="./lib/sample/a+b">A+B问题</Select.Option>
                        </Select>
                    </Form.Item>}
                    <Form.Item wrapperCol={{ offset: 4, span: 16 }}>
                        <Button type="primary" htmlType="submit">创建</Button>
                    </Form.Item>
                </Form>
            </Layout.Content>}
        </Layout>
        <WorkSpaceSetting ref={wssRef} />
    </>
}
export default WelcomePage;
