import './app.scss'
import {HashRouter, Routes, Route} from "react-router-dom";
import WelcomePage from "./views/welcome";
import EditorPage from "./views/editor";

function AppRoot() {
    return (
        <div className="deer-editor-main">
            <HashRouter>
                <Routes>
                    <Route path="/" element={<WelcomePage />} />
                    <Route path="/:problem_dir_name/">
                        <Route index element={<EditorPage />} />
                    </Route>
                </Routes>
            </HashRouter>

        </div>
    );
}

export default AppRoot;
