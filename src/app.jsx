import './app.scss'
import {BrowserRouter, Routes, Route} from "react-router-dom";
import WelcomePage from "./views/welcome";
import EditorPage from "./views/editor";

function AppRoot() {
    return (
        <div className="deer-editor-main">
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<WelcomePage />} />
                    <Route path="/:problem_dir_name/">
                        <Route index element={<EditorPage />} />
                    </Route>
                </Routes>
            </BrowserRouter>

        </div>
    );
}

export default AppRoot;
