import React, {useState, useRef} from 'react';
import ini from "ini";

const App = () => {
  let fileArray = useRef();
  const [fileName, setFileName] = useState('無');
  const [loaded, setloaded] = useState('預備中');
  const [type, setType] = useState('84');

  const uploadFile = (e) => {
    setFileName('無')
    fileArray.current = e.target.files
    let tempName = '';
    for (let i = 0; i < e.target.files.length; i++) {
      tempName += e.target.files[i].name;
      if (i !== e.target.files.length - 1)
        tempName += " | ";
    }
    setFileName(tempName);
    setloaded('預備中')
  }

  const startParse = () => {
    setloaded('轉換中')
    let index = 0

    const fileReader = new FileReader();
    fileReader.onload = function (fileLoadedEvent) {
      const iniFile = ini.parse(fileLoadedEvent.target.result);
      const tempFileName = fileArray.current[index].name.split('.')
      getData(iniFile, tempFileName[0]);
      if (index < fileArray.current.length - 1) {
        index++;
        fileReader.readAsText(fileArray.current[index], "UTF-8");
      }
    };
    fileReader.readAsText(fileArray.current[index], "UTF-8");
  }

  const getData = (iniFile, name) => {
    const positionArray = [];
    for (let i = 0; i <= 91; i++) {
      if (type === '84')
        if (i === 35 || i === 37 || i === 84 || i === 86 || i === 87 || i === 89 || i === 90 || i === 91)
          continue
      const position = iniFile.Landmark[`Landmark_${i}`].split(" ");
      const object = {x: parseInt(position[0]), y: parseInt(position[1])};
      positionArray.push(object);
    }
    const newInput = JSON.stringify(positionArray, null, 2);
    downloadText(`${name}.json`, newInput)
  }

  const downloadText = (filename, text) => {
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.click();
    setloaded('下載完成')
  }

  return (
    <div className="container bg-white" style={{height: window.innerHeight + 'px', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
      <h2>.ini轉JSON</h2>
      <input className="form-control" id="upload" type="file" accept=".ini" onChange={(e) => uploadFile(e)} multiple />
      <hr />
      檔案 : {fileName}
      <hr />
      <div>
        <input key={0} type="radio" name="type" value={'84'} defaultChecked={true} onChange={(e) => (e.target.checked === true && setType('84'))} />84個、
        <input key={1} type="radio" name="type" value={'92'} onChange={(e) => (e.target.checked === true && setType('92'))} />92個 特徵點
      </div>
      <hr />
      模式 : {type}個特徵點
      <hr />
      <button className="btn btn-primary" onClick={() => startParse()} >下載</button>
      <hr />
      處理狀態 : {loaded}
      <hr />
    </div>
  );
}

export default App;
