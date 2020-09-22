import React, {useState, useRef} from 'react';
import ini from "ini"; // 可直接將ini檔轉成object

const App = () => {
  let fileArray = useRef(); //上傳檔案的指標
  const [fileName, setFileName] = useState('無');
  const [loaded, setloaded] = useState('預備中');
  const [type, setType] = useState('84');

  const uploadFile = (e) => { //處理上傳的檔案
    setFileName('無')
    fileArray.current = e.target.files //指標指向的位置
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
    if (fileArray.current === undefined)
      return
    setloaded('轉換中')
    let index = 0
    const fileReader = new FileReader();
    fileReader.onload = function (fileLoadedEvent) {
      const iniFile = ini.parse(fileLoadedEvent.target.result);
      const tempFileName = fileArray.current[index].name.split('.')
      getData(iniFile, tempFileName[0]);
      if (index < fileArray.current.length - 1) { //使用for迴圈的話，會因為非同步的關係，造成Readerbuffer阻塞，所以使用recursion
        index++;
        fileReader.readAsText(fileArray.current[index], "UTF-8");
      }
    };
    fileReader.readAsText(fileArray.current[index], "UTF-8");
  }

  const getData = (iniFile, name) => { //將 ini. 檔轉換成json
    const positionArray = [];
    const exclude92to84 = [35, 37, 84, 86, 87, 89, 90, 91];
    for (let i = 0; i <= 91; i++) {
      if (type === '84')
        if (exclude92to84.includes(i))
          continue
      const position = iniFile.Landmark[`Landmark_${i}`].split(" ");
      const object = {x: parseInt(position[0]), y: parseInt(position[1])};
      positionArray.push(object);
    }
    const newInput = JSON.stringify(positionArray, null, 2);
    downloadText(`${name}.json`, newInput)
  }

  const downloadText = (filename, text) => { //直接在真實的Dom操作下載link，用react的話還要ref
    let element = document.createElement('a'); 
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.click();
    setloaded('下載完成')
  }

  return (
    <div className="container bg-white" style={{height: window.innerHeight + 'px', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
      <h1 style={{alignSelf: 'center', position: 'absolute', top: '50px'}}>.ini轉JSON</h1>
      <input className="form-control" id="upload" type="file" accept=".ini" onChange={(e) => uploadFile(e)} multiple />可多選
      <hr />
      檔案 : {fileName}
      <hr />
      <div>
        <input key={0} type="radio" name="type" value={'84'} defaultChecked={true} onChange={(e) => (e.target.checked === true && setType('84'))} />84個、
        <input key={1} type="radio" name="type" value={'92'} onChange={(e) => (e.target.checked === true && setType('92'))} />92個 特徵點　　　目前WCM預設84個
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
