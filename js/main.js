$.fn.message = function() { return $(`#${$(this).data("message-id")}`); };

const fixValue = function(dial, value) {
  if (value < dial.o.min) {
    return dial.o.min;
  } else if (value > dial.o.max) {
    return dial.o.max;
  } else {
    return value;
  }
};

class FIASCalculator {
  constructor() {
    $("[data-dial]").knob({
      min: 1,
      max: 10,
      fgColor: "#468847",
      angleOffset: "-125",
      angleArc: "250",
      thickness: "0.3",
      change: this.changed,
      draw: this.updateFinalScore
    });

    $("#final-score").knob({
      min: 3,
      max: 30,
      fgColor: "#C09853",
      thickness: 0.5,
      width: 300,
      height: 400,
      readOnly: true
    });

    this.parseURL();

    const { changed } = this;
    $("[data-dial]").each(function() {
      return changed.call($(this).data("knob"), $(this).val());
    });

    new Clipboard('#final-copy-btn').on('success', ({trigger}) => {
      const original = trigger.innerHTML;
      trigger.innerHTML = 'Copied!';
      return setTimeout(() => trigger.innerHTML = original
      , 1000);
    });
  }

  changed(value) {
    value = fixValue(this, value);
    const $input = $(this.i);
    const $message = $input.message();
    const score = new Score($input.data("dial"), value);

    $message.html(score.message);
    $message.removeClass(score.cssClasses().join(" "));
    $message.addClass(score.css);
    return $input.trigger("configure", {fgColor:score.color});
  }

  updateFinalScore() {
    const values = $("[data-dial]").map((_, dial) => parseInt($(dial).val())).toArray();
    const knob = $("#final-score").data("knob");

    if (knob) {
      const score = new FinalScore(values);
      knob.val(score.total);
      knob.$.trigger("configure", {fgColor:score.color});
      const $message = knob.$.message();
      $message.html(score.message());
      return score.updateURL();
    }
  }

  parseURL() {
    if (window.location.search) {
      const values = [
        this.getParameterByName("v1"),
        this.getParameterByName("v2"),
        this.getParameterByName("v3")
      ];
      return $("[data-dial]").each((i, elem) => $(elem).data("knob").val(values[i]));
    }
  }

  // Stolen shamelessly from http://stackoverflow.com/a/901144/410759
  getParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    const regexS = `[\\?&]${name}=([^&#]*)`;
    const regex = new RegExp(regexS);
    const results = regex.exec(window.location.search);
    if(results === null) {
      return "";
    } else {
      return decodeURIComponent(results[1].replace(/\+/g, " "));
    }
  }
}

var Score = (function() {
  let messages = undefined;
  Score = class Score {
    static initClass() {
      messages = [
        [
          "Equivalent to a single partial",
          "A small handful of views",
          "Itʼs everywhere, like the plague",
        ],
        [
          "Nothing - itʼs straight forward",
          "I understand what itʼs doing, but Iʼm not 100% sure about parts",
          "Itʼs freaking greek",
        ],
        [
          "Cʼmon - itʼs a copy change",
          "I could see some potential for problems, but they seem unlikely to have humongous impact",
          "I can imagine about 400 ways this blows up",
        ]
      ];
    }

    constructor(type, value) {
      const index = value <= 3 ? 0
      : (value >= 4) && (value <= 6) ? 1
      : 2;

      this.type    = type;
      this.value   = value;
      this.index   = index;
      this.message = messages[this.type][this.index];

      this.scoreColor = new ScoreColor(this.index);
      this.css        = this.scoreColor.css;
      this.color      = this.scoreColor.color;
    }

    cssClasses() { return this.scoreColor.cssClasses(); }
  };
  Score.initClass();
  return Score;
})();

var ScoreColor = (function() {
  let colors = undefined;
  ScoreColor = class ScoreColor {
    static initClass() {
      colors = [
        {css:"alert-success", color:"#468847"},
        {css:"alert-warning", color:"#C09853"},
        {css:"alert-error",   color:"#B94A48"}
      ];
    }

    constructor(index) {
      this.css     = colors[index].css;
      this.color   = colors[index].color;
    }

    cssClasses() { return colors.map(color => color.css); }
  };
  ScoreColor.initClass();
  return ScoreColor;
})();

var ReviewLevel = (function() {
  let messages = undefined;
  ReviewLevel = class ReviewLevel {
    static initClass() {
      messages = [ "(needs one +1)",
                   "(needs two +1s)",
                   "(needs two +1s and full QA)" ];
    }

    constructor(index) {
      this.message = messages[index];
    }
  };
  ReviewLevel.initClass();
  return ReviewLevel;
})();

class FinalScore {
  constructor(values) {
    this.values = values;
    this.total = values.reduce((sum, v) => sum + v
    , 0);

    this.index = this.total <= 14 ? 0
    : (this.total >= 15) && (this.total <= 19) ? 1
    : 2;

    this.scoreColor  = new ScoreColor(this.index);
    this.reviewLevel = new ReviewLevel(this.index);
    this.css         = this.scoreColor.css;
    this.color       = this.scoreColor.color;
  }

  cssClasses() { return this.scoreColor.cssClasses(); }

  message() {
    const url = `${window.location.origin}${window.location.pathname}${this.queryString()}`;

    const emoji = (() => { switch (this.index) {
      case 0: return ":ok_hand:";
      case 1: return ":warning:";
      case 2: return ":bomb:";
    } })();
    return `[${emoji} FIAS: ${this.values.join(" / ")} = ${this.total}](${url}) -- ${this.reviewLevel.message}`;
  }

  queryString() { return `?${$.param({v1:this.values[0], v2:this.values[1], v3:this.values[2]})}`; }

  updateURL() {
    return window.history.replaceState(null, null, this.queryString());
  }
}

window.FIASCalculator = FIASCalculator;
