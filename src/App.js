import React, { useEffect, useRef, useState } from 'react';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import Nouislider from 'nouislider-react';
import 'nouislider/distribute/nouislider.css';


let ffmpeg; //Store the ffmpeg instance
function App() {
  const [videoDuration, setVideoDuration] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [videoSrc, setVideoSrc] = useState('');
  const [videoFileValue, setVideoFileValue] = useState('');
  const [imageFileValue, setImageFileValue] = useState('');
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [videoTrimmedUrl, setVideoTrimmedUrl] = useState('');
  const [videoRatio, setVideoRatio] = useState({ width: 0, height: 0 })
  const videoRef = useRef();
  let initialSliderValue = 0;

  //Created to load script by passing the required script and append in head tag
  // const loadScript = (src) => {
  //   return new Promise((onFulfilled, _) => {
  //     const script = document.createElement('script');
  //     let loaded;
  //     script.async = 'async';
  //     script.defer = 'defer';
  //     script.setAttribute('src', src);
  //     script.onreadystatechange = script.onload = () => {
  //       if (!loaded) {
  //         onFulfilled(script);
  //       }
  //       loaded = true;
  //     };
  //     script.onerror = function () {
  //       console.log('Script failed to load');
  //     };
  //     document.getElementsByTagName('head')[0].appendChild(script);
  //   });
  // };

  //Handle Upload of the video
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const blobURL = URL.createObjectURL(file);
    setVideoFileValue(file);
    setVideoSrc(blobURL);
  };

  //Handle Upload of the image
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    setImageFileValue(file);
  };

  //Convert the time obtained from the video to HH:MM:SS format
  const convertToHHMMSS = (val) => {
    const secNum = parseInt(val, 10);
    let hours = Math.floor(secNum / 3600);
    let minutes = Math.floor((secNum - hours * 3600) / 60);
    let seconds = secNum - hours * 3600 - minutes * 60;

    if (hours < 10) {
      hours = '0' + hours;
    }
    if (minutes < 10) {
      minutes = '0' + minutes;
    }
    if (seconds < 10) {
      seconds = '0' + seconds;
    }
    let time;
    // only mm:ss
    if (hours === '00') {
      time = minutes + ':' + seconds;
    } else {
      time = hours + ':' + minutes + ':' + seconds;
    }
    return time;
  };

  useEffect(() => {
    //Load the ffmpeg script
    // loadScript(
    //   'https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.11.2/dist/ffmpeg.min.js',
    // ).then(() => {
    //   if (typeof window !== 'undefined') {
    //     // creates a ffmpeg instance.
        ffmpeg = createFFmpeg({ log: true });
        //Load ffmpeg.wasm-core script
        ffmpeg.load();
        //Set true that the script is loaded
        setIsScriptLoaded(true);
      // }
    // });
  }, []);

  //Get the duration of the video using videoRef
  useEffect(() => {
    if (videoRef && videoRef.current) {
      const currentVideo = videoRef.current;
      currentVideo.onloadedmetadata = () => {
        setVideoDuration(currentVideo.duration);
        setEndTime(currentVideo.duration);
        setVideoRatio({ width: currentVideo.videoWidth, height: currentVideo.videoHeight })
      };
    }
  }, [videoSrc]);

  //Called when handle of the nouislider is being dragged
  const updateOnSliderChange = (values, handle) => {
    setVideoTrimmedUrl('');
    let readValue;
    if (handle) {
      readValue = values[handle] | 0;
      if (endTime !== readValue) {
        setEndTime(readValue);
      }
    } else {
      readValue = values[handle] | 0;
      if (initialSliderValue !== readValue) {
        initialSliderValue = readValue;
        if (videoRef && videoRef.current) {
          videoRef.current.currentTime = readValue;
          setStartTime(readValue);
        }
      }
    }
  };

  //Play the video when the button is clicked
  const handlePlay = () => {
    if (videoRef && videoRef.current) {
      videoRef.current.play();
    }
  };

  //Play the video when the button is clicked
  const handlePause = () => {
    if (videoRef && videoRef.current) {
      videoRef.current.pause();
    }
  };

  //Pause the video when then the endTime matches the currentTime of the playing video
  const handlePauseVideo = (e) => {
    const currentTime = Math.floor(e.currentTarget.currentTime);

    if (currentTime === endTime) {
      e.currentTarget.pause();
    }
  };

  //Trim functionality of the video
  const handleTrim = async () => {
    if (isScriptLoaded) {
        const { name, type } = videoFileValue;
        const { name: imageName, type: imageType } = imageFileValue;
        // await ffmpeg.load();
        //Write video to memory
        ffmpeg.FS(
          'writeFile',
          name,
          await fetchFile(videoFileValue),
        );
        
        //Write image to memory
        ffmpeg.FS(
          'writeFile',
          imageName,
          await fetchFile(imageFileValue),
        );

        const videoFileType = type.split('/')[1];
        //Run the ffmpeg command to trim video
        //? trem file code
        // ? Done
        // await ffmpeg.run(
        //   '-i',
        //   name,
        //   '-ss',
        //   `${convertToHHMMSS(startTime)}`,
        //   '-to',
        //   `${convertToHHMMSS(endTime)}`,
        //   '-acodec',
        //   'copy',
        //   '-vcodec',
        //   'copy',
        //   `out.${videoFileType}`,
        // );

        //fade in fade out
        // ? Done
        // await ffmpeg.run(
        //   '-i',
        //   name,
        //   '-vf',
        //   `fade=in:0:d=1`,
        //   `out.${videoFileType}`,
        // );


        // fade between two videos in white
        // ? Done
        // await ffmpeg.run(
        //   '-i',
        //   name,
        //   '-i',
        //   name,
        //   '-filter_complex',
        //   `[0]fade=t=out:d=0.2:st=2.9:c=white[v0];[1]fade=t=in:d=0.2:c=white[v1];[v0][0:a][v1][1:a]concat=n=2:v=1:a=1[v][a]`,
        //   '-map',
        //   '[v]',
        //   '-map',
        //   '[a]',
        //   `out.${videoFileType}`,
        // );

        // add text to video
        // ! showing errors
        // await ffmpeg.run(
        //   '-i',
        //   name,
        //   '-vf',
        //   `drawtext=text='Hello world':x=(w-text_w)/2:y=(h-text_h)/2:fontfile==/system/fonts/DroidSans-Bold.ttf:fontcolor=white:fontsize=48`,
        //   `out.${videoFileType}`,
        // );
        

        // add two videos beside the other
        // ? Done
        // await ffmpeg.run(
        //   '-i',
        //   name,
        //   '-i',
        //   name,
        //   '-filter_complex',
        //   '[1:v][0:v]scale2ref[wm][base];[base][wm]hstack=2',
        //   `out.${videoFileType}`,
        // );
        
        // add four videos in a grid using ffmpeg
        // ? Done
        // await ffmpeg.run(
        //   '-i',
        //   name,
        //   '-i',
        //   name,
        //   '-i',
        //   name,
        //   '-i',
        //   name,
        //   '-filter_complex',
        //   '[0:v][1:v]hstack=inputs=2[top];[2:v][3:v]hstack=inputs=2[bottom];[top][bottom]vstack=inputs=2',
        //   `out.${videoFileType}`,
        // );

        // merge two videos after the other
        // ? Done
        // await ffmpeg.run(
        //   '-i',
        //   name,
        //   '-i',
        //   name,
        //   '-filter_complex',
        //   '[0:v] [0:a] [1:v] [1:a] concat=n=2:v=1:a=1 [v] [a]',
        //   '-map',
        //   '[v]',
        //   '-map',
        //   '[a]',
        //   `out.${videoFileType}`,
        // );
        
        // add image to video
        // ? Done
        // await ffmpeg.run(
        //   '-i',
        //   name,
        //   '-i',
        //   imageName,
        //   '-filter_complex',
        //   `[1:v]scale=${videoRatio.width}:${videoRatio.height}[wm];[0:v][wm]overlay=0:0`,
        //   `out.${videoFileType}`,
        // );
        
        // add sound to video and mute the video
        // ? Done
        // await ffmpeg.run(
        //   '-i',
        //   name,
        //   '-i',
        //   imageName,
        //   "-filter_complex",
        //   "[1:a]amerge=inputs=1[a]",
        //   "-map",
        //   "0:v",
        //   "-map",
        //   "[a]",
        //   "-c:v",
        //   "copy",
        //   "-ac",
        //   "1",
        //   "-shortest",
        //   `out.${videoFileType}`
        // );

        //Convert data to url and store in videoTrimmedUrl state
        let data = ffmpeg.FS('readFile', `out.${videoFileType}`);
        let url = URL.createObjectURL(
          new Blob([data.buffer], { type: videoFileValue.type }),
        );
        setVideoTrimmedUrl(url);
      
    }
  };

  const handleDownload = () => {
    const { name,type } = videoFileValue;
    let a = document.createElement('a');
    a.href = videoTrimmedUrl;
    a.download = name+"."+type.split('/')[1];
    a.click();
  };

  return (
    <div className="App">
      <input type="file" onChange={handleFileUpload} />
      <input type="file" onChange={handleImageUpload} />
      <br />
      {videoSrc.length ? (
        <React.Fragment>
          <video src={videoSrc} ref={videoRef} onTimeUpdate={handlePauseVideo}>
            <source src={videoSrc} type={videoFileValue.type} />
          </video>
          <br />
          <Nouislider
            behaviour="tap-drag"
            step={1}
            margin={1}
            limit={30}
            range={{ min: 0, max: videoDuration || 2 }}
            start={[0, videoDuration || 2]}
            connect
            onUpdate={updateOnSliderChange}
          />
          <br />
          Start duration: {convertToHHMMSS(startTime)} &nbsp; End duration:{' '}
          {convertToHHMMSS(endTime)}
          <br />
          <button onClick={handlePlay}>Play</button> &nbsp;
          <button onClick={handlePause}>Pause</button> &nbsp;
          <button onClick={handleTrim}>Trim</button> &nbsp;
          <button onClick={handleDownload}>Download</button>
          <br />
          {videoTrimmedUrl && (
            <video controls>
              <source src={videoTrimmedUrl} type={videoFileValue.type} />
            </video>
          )}
        </React.Fragment>
      ) : (
        ''
      )}
    </div>
  );
}

export default App;
