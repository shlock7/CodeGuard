import React from 'react';
import Editor, {Monaco} from '@monaco-editor/react';

interface MonacoEditorProps {
    onMount: (editor: any, monaco: Monaco) => void;
    defaultLanguage: string;
    path: string;
}

const MonacoEditor: React.FC<MonacoEditorProps> = ({onMount, defaultLanguage, path}) => {
    return (
        <div className="h-full">
            <Editor
                height="82vh"
                path={path}
                defaultLanguage={defaultLanguage}
                defaultValue={"// write your code here"}
                theme={"vs-dark"}
                onMount={onMount}
            />
        </div>
    );
};

export default MonacoEditor;
