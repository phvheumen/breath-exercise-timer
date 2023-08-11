function getAssetsLocation() {
  return `${window.location.href}/assets/`;
}

const rangeInputIn = document.getElementById('sliderBreathIn');
const textInputIn = document.getElementById('inputBreathIn');
const rangeInputHold = document.getElementById('sliderBreathHold');
const textInputHold = document.getElementById('inputBreathHold');
const rangeInputOut = document.getElementById('sliderBreathOut');
const textInputOut = document.getElementById('inputBreathOut');
const buttonStart = document.getElementById('buttonStart');
const textInputCycleIncrement = document.getElementById('inputIncrementCycle');
const textInputIncerementInterval = document.getElementById('inputIncrementInterval');

function zeroFalsey(val) {
  if (!val) {
    return '0';
  }

  return String(val);
}

textInputIn.addEventListener('input', (event) => {
  rangeInputIn.value = zeroFalsey(event.target.value);
});

rangeInputIn.addEventListener('input', (event) => {
  textInputIn.value = zeroFalsey(event.target.value);
});

textInputOut.addEventListener('input', (event) => {
  rangeInputOut.value = zeroFalsey(event.target.value);
});

rangeInputOut.addEventListener('input', (event) => {
  textInputOut.value = zeroFalsey(event.target.value);
});

textInputHold.addEventListener('input', (event) => {
  rangeInputHold.value = zeroFalsey(event.target.value);
});

rangeInputHold.addEventListener('input', (event) => {
  textInputHold.value = zeroFalsey(event.target.value);
});

const audio = {
  sectionOneAudioSrc: `${getAssetsLocation()}/audio/section_1.mp3`,
  sectionTwoAudioSrc: `${getAssetsLocation()}/audio/section_2.mp3`,
  sectionThreeAudioSrc: `${getAssetsLocation()}/audio/section_3.mp3`,

  init() {
    this.sectionOneAudio = document.createElement('audio');
    this.sectionOneAudio.setAttribute('src', this.sectionOneAudioSrc);
    this.sectionTwoAudio = document.createElement('audio');
    this.sectionTwoAudio.setAttribute('src', this.sectionTwoAudioSrc);
    this.sectionThreeAudio = document.createElement('audio');
    this.sectionThreeAudio.setAttribute('src', this.sectionThreeAudioSrc);
  },

  play(currentSection) {
    switch (currentSection) {
      case 0:
        this.sectionOneAudio.play();
        this.sectionTwoAudio.pause();
        this.sectionThreeAudio.pause();
        this.sectionTwoAudio.currentTime = 0;
        this.sectionThreeAudio.currentTime = 0;
        break;

      case 1:
        this.sectionTwoAudio.play();
        this.sectionOneAudio.pause();
        this.sectionThreeAudio.pause();
        this.sectionOneAudio.currentTime = 0;
        this.sectionThreeAudio.currentTime = 0;
        break;

      case 2:
        this.sectionThreeAudio.play();
        this.sectionOneAudio.pause();
        this.sectionTwoAudio.pause();
        this.sectionOneAudio.currentTime = 0;
        this.sectionTwoAudio.currentTime = 0;
        break;
      default:
    }
  },

  deinit() {
    this.sectionOneAudio.remove();
    this.sectionTwoAudio.remove();
    this.sectionThreeAudio.remove();
  },

};

let animate;

const anim = {
  start(sectionsDuration, currentCycle = 1) {
    this.tZero = Date.now();
    this.sectionsDuration = sectionsDuration;
    this.currentSection = 0;
    this.currentCycle = currentCycle;

    audio.play(this.currentSection);

    animate = requestAnimationFrame(this.run.bind(this));
  },

  run() {
    const duration = this.sectionsDuration[this.currentSection];
    const u = (Date.now() - this.tZero) / duration;

    if (u < 1) {
      // Keep requesting frames, till animation is ready
      animate = requestAnimationFrame(this.run.bind(this));
    } else {
      // Or move on to the next section
      this.onFinish();
    }
  },

  onFinish() {
    if (this.currentSection < 2) {
      // Move to a new section of track
      this.tZero = Date.now();
      this.currentSection += 1;

      audio.play(this.currentSection);

      animate = requestAnimationFrame(this.run.bind(this));
    } else if (this.currentCycle % textInputCycleIncrement.value === 0) {
      textInputIn.value = Number(textInputIn.value) + Number(textInputIncerementInterval.value);
      textInputOut.value = Number(textInputOut.value) + Number(textInputIncerementInterval.value);
      textInputHold.value = Number(textInputHold.value) + Number(textInputIncerementInterval.value);
      this.start(
        [textInputIn.value * 1000, textInputOut.value * 1000, textInputHold.value * 1000],
        this.currentCycle + 1,
      );
    } else {
      this.start(this.sectionsDuration, this.currentCycle + 1);
    }
  },

  stop() {
    this.currentSection = 0;
    cancelAnimationFrame(animate);
    audio.sectionOneAudio.muted = true;
    audio.sectionTwoAudio.muted = true;
    audio.sectionThreeAudio.muted = true;
  },

};

let interval;

const timer = {
  start() {
    let timerVal = '0:00';
    document.getElementById('timerCountDown').textContent = timerVal;

    interval = setInterval(() => {
      const timerValues = timerVal.split(':');
      let minutes = parseInt(timerValues[0], 10);
      let seconds = parseInt(timerValues[1], 10);

      seconds += 1;

      if (seconds > 59) {
        minutes += 1;
      }

      if (seconds > 59) {
        seconds = 0;
      } else if (seconds < 10) {
        seconds = `0${seconds}`;
      }

      timerVal = `${minutes}:${seconds}`;
      document.getElementById('timerCountDown').textContent = timerVal;
    }, 1000);
  },

  stop() {
    clearInterval(interval);
  },

};

buttonStart.addEventListener('click', function () {
  if (this.textContent === 'Start') {
    audio.init();
    anim.start([textInputIn.value * 1000, textInputOut.value * 1000, textInputHold.value * 1000]);
    timer.start();
    this.textContent = 'Stop';
  } else {
    anim.stop();
    audio.deinit();
    timer.stop();
    this.textContent = 'Start';
  }
});
