// TODO:
// X Switch to MS sampling in Cursor.js
// X mode=neutral
// Promises: rewinding
// rewind: calculate steps/ rewindable time scrubber
// Recording is additive, but you can reset the whole thing
// Make sure the CM replay always works right. sometimes it seems to miss selection if you go too fast
// Tab panels
// Fork
// https://github.com/reactjs/react-tabs/blob/master/README.md
// React preview window
// Some way to record DevTools and possibly interactions with the student React App


import React, { Component } from 'react';
import update from 'react-addons-update';
import Button from './Button';
import Cursor from './Cursor';
import RecordAudio from './RecordAudio';
import HistoryControl from './HistoryControl';
import SimplerCodeMirror from './SimplerCodeMirror';
import Xterm from './Xterm';
import logo from './udacity_logo.png';
import './App.css';
import '../node_modules/codemirror/lib/codemirror.css';


class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      mode: 'configuration', // mode is one of : 'configuration', 'recording', 'playback'
      recordingInfo: {},
      playbackInfo: {},
      sliderValue: 0,
      cmOptions: { historyEventDelay: 50 }
    };

  }

  stopPlayback = () => {
    console.log('endPlayback');
    this.setState({mode: 'configuration'});
    this.state.audioObj.pause();
    clearInterval(this.state.playbackInfo.timer);
  }

  saveAudioForPlayback(audioObj) {
    this.setState({audioObj:audioObj});
  }

  startRecording() {
    var now = new Date().getTime();
    const newState = update(this.state, {
      mode: { $set: 'recording' },
      recordingInfo: { $merge: {
        firstRecordingComplete: true,
        recordingStartTime: now
      }}
    });
    this.setState(newState);

    console.log('Recording started.');
  }

  stopRecording() {
    var now = new Date().getTime();
    var duration = now - this.state.recordingInfo.recordingStartTime;
    this.setState({ mode:'configuration', recordingDuration: duration });
    console.log('Recording stopped, duration:', duration);
  }

  startStopPlayback() {
    if (!this.state.recordingInfo.firstRecordingComplete) {
      return;
    }

    if (this.state.mode === 'playback') { // currently playing back, so stop it
      this.stopPlayback();
      return;
    }

    console.log('Playing recording.');
    var now = new Date().getTime();
    const newState = update(this.state, {
      mode: { $set: 'playback'},
      playbackInfo: {
        $merge: {
          startTime: now,
          timer: setInterval(this.updatePlaybackTimer, 10)
        }
      }
    });
    this.setState(newState);
    this.state.audioObj.play();
  }

  updatePlaybackTimer = () => {
    var now = new Date().getTime();
    var currentPosition = now - this.state.playbackInfo.startTime;
    var newSliderValue = (( currentPosition / this.state.recordingDuration) * 1000);
    this.updateSlider(newSliderValue);
    if (currentPosition >= this.state.recordingDuration) {
      console.log('Ending playback from updatePlaybackTimer');
      this.stopPlayback();
    }
  }

  updateSlider = (newSliderValue) => {
    this.setState({sliderValue: newSliderValue});
    //console.log('app.js: set sliderValue=', newSliderValue);
  }

  render() {
    //console.log(this.state.userQuery);
    return (
      <div className="App" ref={(node) => {this.node = node;}} >
      {
       this.props.useHeader !== "0" ? <div className="App-header"><img src={logo} className="App-logo" alt="logo" /><h3>Session Recording Demo</h3></div> : null
      }

      <Cursor id="cursor" mode={this.state.mode} endAllPlayback={this.endAllPlayback} />

      <Button 
        disabled={this.state.mode === 'playback' } 
        click={() => {(this.state.mode === 'recording' ? this.stopRecording() : this.startRecording() ) }}
        label={(this.state.mode === 'recording' ? <i className="fa fa-pause" ></i> : <i className="fa fa-square record-button" ></i>) } 
        title={`Make Recording`}
      />
      
      <Button 
        disabled={this.state.mode === 'recording' || !this.state.recordingInfo.firstRecordingComplete} 
        click={() => this.startStopPlayback()  } 
        label={(this.state.mode === 'playback' ? <i className="fa fa-pause" ></i> : <i className="fa fa-play" ></i>) } 
        title={`Play/Stop`}
      />

      <SimplerCodeMirror 
        mode={this.state.mode} 
        endAllPlayback={this.endAllPlayback} 
        options={this.state.cmOptions}
      />

      <Xterm 
        mode={this.state.mode} 
        endAllPlayback={this.endAllPlayback} 
      />

      <HistoryControl 
        mode={this.state.mode} 
        recordingDuration={this.state.recordingDuration} 
        updateSlider={this.updateSlider} 
        sliderValue={this.state.sliderValue} 
      />

      <RecordAudio 
      mode={this.state.mode} 
      saveAudioForPlayback={(audioUrl) => this.saveAudioForPlayback(audioUrl) } 
      />

      </div>
    );
  }
}

export default App;
