import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";

function EditorPage(){

  const [code,setCode] = useState('');
  const [output,setOutput] = useState("");

  const email = localStorage.getItem("email");

  // LOAD SAVED CODE WHEN PAGE OPENS
  useEffect(()=>{
    const loadCode = async ()=>{
      const res = await fetch("http://localhost:5000/getcode",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({email})
      });

      const data = await res.json();
      setCode(data.code || 'print("Start coding 🚀")');
    };

    loadCode();
  },[]);

  // RUN CODE
  const runCode = async ()=>{
    const res = await fetch("http://localhost:5000/run",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({code})
    });

    const data = await res.json();
    setOutput(data.output);

    // SAVE CODE ALSO
    await fetch("http://localhost:5000/savecode",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({email,code})
    });
  };

  return(
    <div style={{height:"100vh",display:"flex",flexDirection:"column"}}>
      
      <div style={{
        background:"#111",
        color:"white",
        padding:"15px",
        fontSize:"20px"
      }}>
        🚀 CodeLearn Editor
      </div>

      <Editor
        height="60%"
        defaultLanguage="python"
        theme="vs-dark"
        value={code}
        onChange={(value)=>setCode(value)}
      />

      <button onClick={runCode} style={{
        padding:"15px",
        background:"green",
        color:"white",
        border:"none"
      }}>
        ▶ Run Code
      </button>

      <div style={{
        background:"black",
        color:"lime",
        padding:"15px",
        height:"40%",
        overflow:"auto"
      }}>
        <pre>{output}</pre>
      </div>

    </div>
  );
}

export default EditorPage;
