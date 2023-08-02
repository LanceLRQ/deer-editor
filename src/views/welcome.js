import React from 'react';
import {
    Empty, Button, Space, Modal, Input, Typography, Layout, Alert
} from "antd";

const WorkSpaceSetting = React.forwardRef((props, ref) => {
    const [closable, setClosable] = React.useState(false);
    const [workSpace, setWorkSpace] = React.useState('');
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    const handleOk = React.useCallback(() => {
        window.DeerUtils.Global.Setting.Set('workspace', workSpace)
        setIsModalOpen(false);
    }, [workSpace, setIsModalOpen]);

    React.useImperativeHandle(ref, () => ({
        openDialog: () => {
            setIsModalOpen(true);
            setClosable(true);
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

    React.useEffect(() => {
        window.DeerUtils.Global.Setting.Get('workspace').then((workDir) => {
            setWorkSpace(workDir);
            if (!workDir) {
                setIsModalOpen(true);
                setClosable(false);
            } else {
                setClosable(true);
            }
        })
    }, []);

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
    const [workSpace, setWorkSpace] = React.useState('');
    const wssRef = React.useRef();

    const openWorkSpaceDialog = () => {
        if (wssRef.current) {
            wssRef.current.openDialog();
        }
    }

    const StoreListener = (event, nv) => {
        setWorkSpace(nv['workspace']);
    }

    React.useEffect(() => {
        window.DeerUtils.Global.Setting.Get('workspace').then((workDir) => {
            setWorkSpace(workDir);
        });
        window.DeerUtils.Global.Setting.OnDidAnyChange(StoreListener)
        return () => {
            window.DeerUtils.Global.Setting.RemoveDidAnyChange(StoreListener)
        }
    }, []);

    const chooseProblemPackage = async () => {
        const rel = await window.DeerUtils.FS.OpenDialog({
            title: '请选择题题目包',
            properties: [
                'openFile'
            ]
        });
        if (!rel.canceled) {
            const filePath = rel.filePaths[0];
            console.log(filePath)
            // TODO 导入题目数据
        }
    }

    const newProject = async () => {
        // TODO 直接在workspace下创建一个新的题目
    }

    return <>
        <Layout className="deer-editor-main-layout">
            <Alert
                banner
                type="info"
                message={<Typography.Text color="white">当前工作目录：{workSpace} <Typography.Link onClick={openWorkSpaceDialog}>[更改工作目录]</Typography.Link></Typography.Text>}
            ></Alert>
            <Layout.Content>
                <Empty
                    style={{ marginTop: 100 }}
                    description="欢迎使用deer-executor编辑器"
                >
                    <Typography.Paragraph>
                        <Space>
                            <Button type="primary" onClick={newProject}>新建题目</Button>
                            <Button type="default" onClick={chooseProblemPackage}>导入题目</Button>
                        </Space>
                    </Typography.Paragraph>
                </Empty>
            </Layout.Content>
        </Layout>
        <WorkSpaceSetting ref={wssRef} />
    </>
}
export default WelcomePage;
