function getAssetsLocation() {
  return `${window.location.href}/assets/`.replace("index.html", "");
}

const buttonStart = document.getElementById("buttonStart");

function invalidIsZero(val: string): string {
  if (!val) {
    return "0";
  }

  return val;
}

function coupleElementValues(a: HTMLInputElement, b: HTMLInputElement) {
  a.addEventListener("input", (event: Event) => {
    b.value = invalidIsZero(a.value);
  });
  b.addEventListener("input", (event: Event) => {
    a.value = invalidIsZero(b.value);
  });
}

function getInputElementById(elementId: string): HTMLInputElement {
  return document.getElementById(elementId) as HTMLInputElement;
}

coupleElementValues(
  getInputElementById("sliderBreathIn"),
  getInputElementById("inputBreathIn")
);
coupleElementValues(
  getInputElementById("sliderBreathOut"),
  getInputElementById("inputBreathOut")
);
coupleElementValues(
  getInputElementById("sliderBreathHold"),
  getInputElementById("inputBreathHold")
);

const lockInput = {
  lock: false,
  disableLock: [],

  clickEventHandler(elem: HTMLInputElement, event: Event) {
    this.lock = elem.checked;
    this.disableLock.forEach((elem: HTMLInputElement) => {
      elem.disabled = this.lock;
    });
  },

  inputEventHandler(element: HTMLInputElement, event: Event) {
    if (this.lock) {
      this.disableLock.forEach((disabledElement: HTMLInputElement) => {
        disabledElement.value = element.value;
      });
    }
  },

  registerClickEventHandler(elem: HTMLInputElement) {
    elem.addEventListener("click", this.clickEventHandler.bind(this, elem));
  },

  registerDisableOnLock(elems: Array<HTMLInputElement>) {
    this.disableLock = elems;
  },

  registerCoupleOnLock(elem: HTMLInputElement) {
    elem.addEventListener("input", this.inputEventHandler.bind(this, elem));
  },

};

lockInput.registerClickEventHandler(getInputElementById("lockIntervalsCheck"));
lockInput.registerDisableOnLock([
  getInputElementById("sliderBreathOut"),
  getInputElementById("inputBreathOut"),
  getInputElementById("sliderBreathHold"),
  getInputElementById("inputBreathHold"),
]);
lockInput.registerCoupleOnLock(getInputElementById("inputBreathIn"))
lockInput.registerCoupleOnLock(getInputElementById("sliderBreathIn"))

const audio = {
  sectionOneAudioSrc: `${getAssetsLocation()}/audio/section_1.mp3`,
  sectionTwoAudioSrc: `${getAssetsLocation()}/audio/section_2.mp3`,
  sectionThreeAudioSrc: `${getAssetsLocation()}/audio/section_3.mp3`,

  init() {
    this.sectionOneAudio = document.createElement("audio");
    this.sectionOneAudio.setAttribute("src", this.sectionOneAudioSrc);
    this.sectionTwoAudio = document.createElement("audio");
    this.sectionTwoAudio.setAttribute("src", this.sectionTwoAudioSrc);
    this.sectionThreeAudio = document.createElement("audio");
    this.sectionThreeAudio.setAttribute("src", this.sectionThreeAudioSrc);
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

  mute() {
    this.sectionOneAudio.muted = true;
    this.sectionTwoAudio.muted = true;
    this.sectionThreeAudio.muted = true;
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
    } else if (
      this.currentCycle %
        Number(getInputElementById("inputIncrementCycle").value) ===
      0
    ) {
      getInputElementById("inputBreathIn").value = String(
        Number(getInputElementById("inputBreathIn").value) +
          Number(getInputElementById("inputIncrementInterval").value)
      );
      getInputElementById("inputBreathOut").value = String(
        Number(getInputElementById("inputBreathOut").value) +
          Number(getInputElementById("inputIncrementInterval").value)
      );
      getInputElementById("inputBreathHold").value = String(
        Number(getInputElementById("inputBreathHold").value) +
          Number(getInputElementById("inputIncrementInterval").value)
      );
      this.start(
        [
          Number(getInputElementById("inputBreathIn").value) * 1000,
          Number(getInputElementById("inputBreathOut").value) * 1000,
          Number(getInputElementById("inputBreathHold").value) * 1000,
        ],
        this.currentCycle + 1
      );
    } else {
      this.start(this.sectionsDuration, this.currentCycle + 1);
    }
  },

  stop() {
    this.currentSection = 0;
    cancelAnimationFrame(animate);
    audio.mute();
  },
};

let interval;

const timer = {
  start() {
    let timerVal = "0:00";
    document.getElementById("timerCountDown").textContent = timerVal;

    interval = setInterval(() => {
      const timerValues = timerVal.split(":");
      let minutes = parseInt(timerValues[0], 10);
      let seconds = parseInt(timerValues[1], 10);

      seconds += 1;

      if (seconds > 59) {
        minutes += 1;
      }

      if (seconds > 59) {
        seconds = 0;
      }

      if (seconds < 10) {
        timerVal = `${minutes}:0${seconds}`;
      } else {
        timerVal = `${minutes}:${seconds}`;
      }

      document.getElementById("timerCountDown").textContent = timerVal;
    }, 1000);
  },

  stop() {
    clearInterval(interval);
  },
};

buttonStart.addEventListener("click", function () {
  if (this.textContent === "Start") {
    audio.init();
    anim.start([
      Number(getInputElementById("inputBreathIn").value) * 1000,
      Number(getInputElementById("inputBreathOut").value) * 1000,
      Number(getInputElementById("inputBreathHold").value) * 1000,
    ]);
    timer.start();
    this.textContent = "Stop";
  } else {
    anim.stop();
    audio.deinit();
    timer.stop();
    this.textContent = "Start";
  }
});
