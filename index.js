document.addEventListener("DOMContentLoaded", function() {
  const snowContainer = document.querySelector('.snow');
  const numberOfFlakes = 50; // Nombre de flocons de neige que tu veux

  for (let i = 0; i < numberOfFlakes; i++) {
    const snowflake = document.createElement('div');
    snowflake.classList.add('snowflake');
    
    // Définir les propriétés CSS avec des variables pour chaque flocon
    const size = Math.random() * 10 + 5 + 'px'; // Taille entre 5px et 15px
    const duration = Math.random() * 10 + 5 + 's'; // Durée entre 5s et 15s
    const opacity = Math.random() * 0.5 + 0.5; // Opacité entre 0.5 et 1
    const leftPosition = Math.random() * 100 + '%'; // Position horizontale aléatoire
    const delay = Math.random() * 5 + 's'; // Délai d'apparition entre 0s et 5s

    snowflake.style.setProperty('--size', size);
    snowflake.style.setProperty('--duration', duration);
    snowflake.style.setProperty('--opacity', opacity);
    snowflake.style.setProperty('--delay', delay); // Ajoute le délai
    snowflake.style.left = leftPosition;

    snowContainer.appendChild(snowflake);
  }
});



!(function ($) {
  "use strict";

  var Typed = function (el, options) {
    // chosen element to manipulate text
    this.el = $(el);

    // options
    this.options = $.extend({}, $.fn.typed.defaults, options);

    // attribute to type into
    this.isInput = this.el.is("input");
    this.attr = this.options.attr;

    // show cursor
    this.showCursor = this.isInput ? false : this.options.showCursor;

    // text content of element
    this.elContent = this.attr ? this.el.attr(this.attr) : this.el.text();

    // html or plain text
    this.contentType = this.options.contentType;

    // typing speed
    this.typeSpeed = this.options.typeSpeed;

    // add a delay before typing starts
    this.startDelay = this.options.startDelay;

    // backspacing speed
    this.backSpeed = this.options.backSpeed;

    // amount of time to wait before backspacing
    this.backDelay = this.options.backDelay;

    // div containing strings
    this.stringsElement = this.options.stringsElement;

    // input strings of text
    this.strings = this.options.strings;

    // character number position of current string
    this.strPos = 0;

    // current array position
    this.arrayPos = 0;

    // number to stop backspacing on.
    // default 0, can change depending on how many chars
    // you want to remove at the time
    this.stopNum = 0;

    // Looping logic
    this.loop = this.options.loop;
    this.loopCount = this.options.loopCount;
    this.curLoop = 0;

    // for stopping
    this.stop = false;

    // custom cursor
    this.cursorChar = this.options.cursorChar;

    // shuffle the strings
    this.shuffle = this.options.shuffle;
    // the order of strings
    this.sequence = [];

    // All systems go!
    this.build();
  };

  Typed.prototype = {
    constructor: Typed,

    init: function () {
      // begin the loop w/ first current string (global self.strings)
      // current string will be passed as an argument each time after this
      var self = this;
      self.timeout = setTimeout(function () {
        for (var i = 0; i < self.strings.length; ++i) self.sequence[i] = i;

        // shuffle the array if true
        if (self.shuffle) self.sequence = self.shuffleArray(self.sequence);

        // Start typing
        self.typewrite(self.strings[self.sequence[self.arrayPos]], self.strPos);
      }, self.startDelay);
    },

    build: function () {
      var self = this;
      // Insert cursor
      if (this.showCursor === true) {
        this.cursor = $(
          '<span class="typed-cursor">' + this.cursorChar + "</span>"
        );
        this.el.after(this.cursor);
      }
      if (this.stringsElement) {
        self.strings = [];
        this.stringsElement.hide();
        var strings = this.stringsElement.find("p");
        $.each(strings, function (key, value) {
          self.strings.push($(value).html());
        });
      }
      this.init();
    },

    // pass current string state to each function, types 1 char per call
    typewrite: function (curString, curStrPos) {
      // exit when stopped
      if (this.stop === true) {
        return;
      }

      // varying values for setTimeout during typing
      // can't be global since number changes each time loop is executed
      var humanize = Math.round(Math.random() * (100 - 30)) + this.typeSpeed;
      var self = this;

      // ------------- optional ------------- //
      // backpaces a certain string faster
      // ------------------------------------ //
      // if (self.arrayPos == 1){
      //  self.backDelay = 50;
      // }
      // else{ self.backDelay = 500; }

      // contain typing function in a timeout humanize'd delay
      self.timeout = setTimeout(function () {
        // check for an escape character before a pause value
        // format: \^\d+ .. eg: ^1000 .. should be able to print the ^ too using ^^
        // single ^ are removed from string
        var charPause = 0;
        var substr = curString.substr(curStrPos);
        if (substr.charAt(0) === "^") {
          var skip = 1; // skip atleast 1
          if (/^\^\d+/.test(substr)) {
            substr = /\d+/.exec(substr)[0];
            skip += substr.length;
            charPause = parseInt(substr);
          }

          // strip out the escape character and pause value so they're not printed
          curString =
            curString.substring(0, curStrPos) +
            curString.substring(curStrPos + skip);
        }

        if (self.contentType === "html") {
          // skip over html tags while typing
          var curChar = curString.substr(curStrPos).charAt(0);
          if (curChar === "<" || curChar === "&") {
            var tag = "";
            var endTag = "";
            if (curChar === "<") {
              endTag = ">";
            } else {
              endTag = ";";
            }
            while (curString.substr(curStrPos).charAt(0) !== endTag) {
              tag += curString.substr(curStrPos).charAt(0);
              curStrPos++;
            }
            curStrPos++;
            tag += endTag;
          }
        }

        // timeout for any pause after a character
        self.timeout = setTimeout(function () {
          if (curStrPos === curString.length) {
            // fires callback function
            self.options.onStringTyped(self.arrayPos);

            // is this the final string
            if (self.arrayPos === self.strings.length - 1) {
              // animation that occurs on the last typed string
              self.options.callback();

              self.curLoop++;

              // quit if we wont loop back
              if (self.loop === false || self.curLoop === self.loopCount)
                return;
            }

            self.timeout = setTimeout(function () {
              self.backspace(curString, curStrPos);
            }, self.backDelay);
          } else {
            /* call before functions if applicable */
            if (curStrPos === 0) self.options.preStringTyped(self.arrayPos);

            // start typing each new char into existing string
            // curString: arg, self.el.html: original text inside element
            var nextString = curString.substr(0, curStrPos + 1);
            if (self.attr) {
              self.el.attr(self.attr, nextString);
            } else {
              if (self.isInput) {
                self.el.val(nextString);
              } else if (self.contentType === "html") {
                self.el.html(nextString);
              } else {
                self.el.text(nextString);
              }
            }

            // add characters one by one
            curStrPos++;
            // loop the function
            self.typewrite(curString, curStrPos);
          }
          // end of character pause
        }, charPause);

        // humanized value for typing
      }, humanize);
    },

    backspace: function (curString, curStrPos) {
      // exit when stopped
      if (this.stop === true) {
        return;
      }

      // varying values for setTimeout during typing
      // can't be global since number changes each time loop is executed
      var humanize = Math.round(Math.random() * (100 - 30)) + this.backSpeed;
      var self = this;

      self.timeout = setTimeout(function () {
        // ----- this part is optional ----- //
        // check string array position
        // on the first string, only delete one word
        // the stopNum actually represents the amount of chars to
        // keep in the current string. In my case it's 14.
        // if (self.arrayPos == 1){
        //  self.stopNum = 14;
        // }
        //every other time, delete the whole typed string
        // else{
        //  self.stopNum = 0;
        // }

        if (self.contentType === "html") {
          // skip over html tags while backspacing
          if (curString.substr(curStrPos).charAt(0) === ">") {
            var tag = "";
            while (curString.substr(curStrPos).charAt(0) !== "<") {
              tag -= curString.substr(curStrPos).charAt(0);
              curStrPos--;
            }
            curStrPos--;
            tag += "<";
          }
        }

        // ----- continue important stuff ----- //
        // replace text with base text + typed characters
        var nextString = curString.substr(0, curStrPos);
        if (self.attr) {
          self.el.attr(self.attr, nextString);
        } else {
          if (self.isInput) {
            self.el.val(nextString);
          } else if (self.contentType === "html") {
            self.el.html(nextString);
          } else {
            self.el.text(nextString);
          }
        }

        // if the number (id of character in current string) is
        // less than the stop number, keep going
        if (curStrPos > self.stopNum) {
          // subtract characters one by one
          curStrPos--;
          // loop the function
          self.backspace(curString, curStrPos);
        }
        // if the stop number has been reached, increase
        // array position to next string
        else if (curStrPos <= self.stopNum) {
          self.arrayPos++;

          if (self.arrayPos === self.strings.length) {
            self.arrayPos = 0;

            // Shuffle sequence again
            if (self.shuffle) self.sequence = self.shuffleArray(self.sequence);

            self.init();
          } else
            self.typewrite(
              self.strings[self.sequence[self.arrayPos]],
              curStrPos
            );
        }

        // humanized value for typing
      }, humanize);
    },
    /**
     * Shuffles the numbers in the given array.
     * @param {Array} array
     * @returns {Array}
     */
    shuffleArray: function (array) {
      var tmp,
        current,
        top = array.length;
      if (top)
        while (--top) {
          current = Math.floor(Math.random() * (top + 1));
          tmp = array[current];
          array[current] = array[top];
          array[top] = tmp;
        }
      return array;
    },
    // Reset and rebuild the element
    reset: function () {
      var self = this;
      clearInterval(self.timeout);
      var id = this.el.attr("id");
      this.el.after('<span id="' + id + '"/>');
      this.el.remove();
      if (typeof this.cursor !== "undefined") {
        this.cursor.remove();
      }
      // Send the callback
      self.options.resetCallback();
    },
  };

  $.fn.typed = function (option) {
    return this.each(function () {
      var $this = $(this),
        data = $this.data("typed"),
        options = typeof option == "object" && option;
      if (!data) $this.data("typed", (data = new Typed(this, options)));
      if (typeof option == "string") data[option]();
    });
  };

  $.fn.typed.defaults = {
    strings: [
      "These are the default values...",
      "You know what you should do?",
      "Use your own!",
      "Have a great day!",
    ],
    stringsElement: null,
    // typing speed
    typeSpeed: 0,
    // time before typing starts
    startDelay: 0,
    // backspacing speed
    backSpeed: 0,
    // shuffle the strings
    shuffle: false,
    // time before backspacing
    backDelay: 500,
    // loop
    loop: false,
    // false = infinite
    loopCount: false,
    // show cursor
    showCursor: true,
    // character for cursor
    cursorChar: "|",
    // attribute to type (null == text)
    attr: null,
    // either html or text
    contentType: "html",
    // call when done callback function
    callback: function () {},
    // starting callback function before each string
    preStringTyped: function () {},
    //callback for every typed string
    onStringTyped: function () {},
    // callback for reset
    resetCallback: function () {},
  };
})(window.jQuery);

$("document").ready(function () {
  handleEscKey();
  handleTyping();
});

// LORSQU'ON APPUIS SUR ECHAP on retourne au "sidebar"
function handleEscKey() {
  $(document).on("keyup", function (e) {
    if (e.keyCode === 27) {
      var href = $(this).attr("href");
      $("html, body").animate(
        {
          scrollTop: $(href).offset().top,
        },
        600
      );
      $("#sidebar")
        .removeClass("animated slideInLeft")
        .addClass("animated slideOutLeft");
      return false;
    }
  });
}
// TYPED : remplacement après le backspace
function handleTyping() {
  $(".element").typed({
    strings: [
      "un développeur full-stack",
      "un amoureux des canidés",
      "un junior en dev",
      "un passionné de la tech",
      "un enthousiaste du code",
      "un amateur de jeux vidéo",
      "un amoureux de la nature",
      "un passionné de la cuisine",
      "un fan de séries",
      "un admirateur du japon",
      "un geek assumé",
      "un passionné du web",
      "un explorateur digital",
    ],
    typeSpeed: 50,
    starDelay: 200,
    backDelay: 600,
    loop: true,
    showCursor: true,
    cursorChar: "|",
  });
}

/*

new js

*/

$(function () {
  $("a.page-scroll").bind("click", function (event) {
    var $anchor = $(this);
    $("html, body")
      .stop()
      .animate(
        {
          scrollTop: $($anchor.attr("href")).offset().top,
        },
        1500,
        "easeInOutExpo"
      );
    event.preventDefault();
  });
});

// Highlight the top nav as scrolling occurs
$("body").scrollspy({
  target: ".navbar-fixed-top",
});

// Closes the Responsive Menu on Menu Item Click
$(".navbar-collapse ul li a").click(function () {
  $(".navbar-toggle:visible").click();
});


/*
  pie chart
*/

var gradients = [
  {id: 'pink', start: '#b34f53', end: '#dd5b59'},
  {id: 'pinkAssessFirst', start: '#FF2F92', end: '#FF73B2'},
  {id: 'blue', start: '#095a82', end: '#0170a7'},
  {id: 'blueAssessFirst', start: '#0096FF', end: '#66B8FF'},
  {id: 'blueClairAssessFirst', start: '#80CAFF', end: '#B3E0FF'},
  {id: 'red', start: '#874d2a', end: '#a55724'},
  {id: 'green', start: '#5b7964', end: '#869d8d'},
  {id: 'greenAssessFirst', start: '#52A003', end: '#8ACC55'},
  {id: 'aqua', start: '#3f6071', end: '#588094'},
  {id: 'yellowAssessFirst', start: '#F8BC4D', end: '#FFD68A'},
  {id: 'orangeAssessFirst', start: '#F06F38', end: '#FFA573'},
  {id: 'greyAssessFirst', start: '#CDD1D6', end: '#E4E6E9'},
  {id: 'other', start: '#2272ad', end: '#308cd0'}
];

var data = [];

data['piedata'] = [
  { label: "Rigueur", value: 25, color: 'blueAssessFirst' },
  { label: "Empathie", value: 27, color: 'greenAssessFirst' },
  { label: "Créativité", value: 24, color: 'yellowAssessFirst' },
  { label: "Management", value: 24, color: 'pinkAssessFirst' }
];

data['piedata2'] = [
  { label: "Dynamisme", value: 45, color: 'greenAssessFirst' },
  { label: "Stabilité", value: 55, color: 'blueAssessFirst' }
];
data['piedata3'] = [
  { label: "Approfondir", value: 18, color: 'greyAssessFirst' },
  { label: "Innover", value: 35, color: 'orangeAssessFirst' },
  { label: "Experimenter", value: 33, color: 'blueAssessFirst' },
  { label: "Appliquer", value: 15, color: 'blueClairAssessFirst' }
];

// $(document).ready(function() {
//   $('[data-pie]').each(function() {
//     var chartId = '#' + $(this).attr('id');
//     var chartLabel = $(this).attr('data-pie-label');
//     var piedata = data[$(this).attr('data-pie')];
    
//     var width = 300,
//     height = 300,
//     radius = 140;

//     var pie = d3.layout.pie()
//       .value(function(d) {
//         return d.value;
//       })
//       .sort(null);

//     var arc = d3.svg.arc()
//       .outerRadius(radius)
//       .innerRadius(radius / 1.5);

//     var max = d3.max(piedata, function(d) { return +d.value;} );

//     var myChart = d3.select(chartId).append('svg')
//       .attr('width', width)
//       .attr('height', height)
//       .append('g')
//         .attr('transform', 'translate('+ (width / 2) +', '+ (height / 2) +')')
//         .selectAll('path').data(pie(piedata))
//         .enter().append('g')
//           .attr('class', function(d, i) {
//             var cssClass = 'slice';
//             if (d.data.value === max) {
//               cssClass += ' max';
//             }
//             return cssClass;
//           });

//     var gradient = d3.select(chartId + ' svg')
//       .selectAll('linearGradient').data(gradients)
//       .enter().append('linearGradient')
//         .attr('id', function(d, i) {
//           return gradients[i].id;
//         });

//     gradient.append('stop')
//       .attr('offset', '0%')
//       .attr('stop-color', function(d, i) {
//         return gradients[i].start;
//       });

//     gradient.append('stop')
//       .attr('offset', '100%')
//       .attr('stop-color', function(d, i) {
//         return gradients[i].end;
//       });

//     var slices = d3.selectAll(chartId + ' g.slice')
//       .append('path')
//         .attr('fill', function(d, i) {
//           return 'url(#' + d.data.color + ')';
//         })
//         .attr('d', arc)
//         .on('mouseover', function(d, i) {
//           var gradient = gradients.filter(function( obj ) {
//             return obj.id == d.data.color;
//           });
//           $(chartId + ' [data-slice]').css('opacity', 0.5);
//           $(chartId + ' [data-slice=' + i + ']').css({
//             'background': gradient[0].end,
//             'opacity': 1
//           });
//         })
//         .on('mouseout', function(d, i) {
//           $(chartId + ' [data-slice]').css('opacity', 1);
//           $(chartId + ' [data-slice=' + i + ']').css('background', 'rgba(0,0,0,0.2)');
//         });

//     var legend = d3.select(chartId)
//       .attr('class', 'pie-chart')
//       .append('ul')
//         .attr('class', 'legend')
//         .selectAll('li').data(pie(piedata))
//         .enter().append('li')
//           .attr('data-slice', function(d, i) {
//             return i;
//           })
//           .attr('style', function(d, i) {
//             var gradient = gradients.filter(function( obj ) {
//               return obj.id == d.data.color;
//             });
//             return 'border-bottom: solid 3px ' + gradient[0].end;
//           })
//           .text(function(d, i) {
//             return d.data.label + ': ';
//           });

//     legend.append('span')
//       .text(function(d, i) {
//       return d.data.value + '%';
//     });

//     var maxCirc = d3.select(chartId)
//       .append('div')
//       .attr('class', 'max-circ');

//     maxCirc.append('span')
//       .attr('class', 'label')
//       .text(chartLabel);

//     maxCirc.append('span')
//       .attr('class', 'value')
//       .attr('style', function() {
//         var top = piedata.filter(function( obj ) {
//           return obj.value == max;
//         });
//         var gradient = gradients.filter(function( obj ) {
//           return obj.id == top[0].color;
//         });
//         return 'color: ' + gradient[0].end;
//       })
//       .text(function() {
//         var top = piedata.filter(function( obj ) {
//           return obj.value == max;
//         });
//         return top[0].label + ': ' + top[0].value + '%';
//       });
//   });
// });

// $(document).ready(function() {
//   $('[data-pie]').each(function() {
//     var chartId = '#' + $(this).attr('id');
//     var chartLabel = $(this).attr('data-pie-label');
//     var piedata = data[$(this).attr('data-pie')];
    
//     var width = 300,
//     height = 300,
//     radius = 140;

//     var pie = d3.layout.pie()
//       .value(function(d) {
//         return d.value;
//       })
//       .sort(null);

//     var arc = d3.svg.arc()
//       .outerRadius(radius)
//       .innerRadius(radius / 1.5);

//     var max = d3.max(piedata, function(d) { return +d.value;} );

//     var myChart = d3.select(chartId).append('svg')
//       .attr('width', width)
//       .attr('height', height)
//       .append('g')
//         .attr('transform', 'translate('+ (width / 2) +', '+ (height / 2) +')')
//         .selectAll('path').data(pie(piedata))
//         .enter().append('g')
//           .attr('class', function(d, i) {
//             var cssClass = 'slice';
//             if (d.data.value === max) {
//               cssClass += ' max';
//             }
//             return cssClass;
//           });

//     var gradient = d3.select(chartId + ' svg')
//       .selectAll('linearGradient').data(gradients)
//       .enter().append('linearGradient')
//         .attr('id', function(d, i) {
//           return gradients[i].id;
//         });

//     gradient.append('stop')
//       .attr('offset', '0%')
//       .attr('stop-color', function(d, i) {
//         return gradients[i].start;
//       });

//     gradient.append('stop')
//       .attr('offset', '100%')
//       .attr('stop-color', function(d, i) {
//         return gradients[i].end;
//       });

//     var slices = d3.selectAll(chartId + ' g.slice')
//       .append('path')
//         .attr('fill', function(d, i) {
//           return 'url(#' + d.data.color + ')';
//         })
//         .attr('d', arc)
//         .on('mouseover', function(d, i) {
//           var gradient = gradients.filter(function( obj ) {
//             return obj.id == d.data.color;
//           });
//           $(chartId + ' [data-slice]').css('opacity', 0.5);
//           $(chartId + ' [data-slice=' + i + ']').css({
//             'background': gradient[0].end,
//             'opacity': 1
//           });
//         })
//         .on('mouseout', function(d, i) {
//           $(chartId + ' [data-slice]').css('opacity', 1);
//           $(chartId + ' [data-slice=' + i + ']').css('background', 'rgba(0,0,0,0.2)');
//         });

//     var legend = d3.select(chartId)
//       .attr('class', 'pie-chart')
//       .append('ul')
//         .attr('class', 'legend')
//         .selectAll('li').data(pie(piedata))
//         .enter().append('li')
//           .attr('data-slice', function(d, i) {
//             return i;
//           })
//           .attr('style', function(d, i) {
//             var gradient = gradients.filter(function( obj ) {
//               return obj.id == d.data.color;
//             });
//             return 'border-bottom: solid 3px ' + gradient[0].end;
//           })
//           .text(function(d, i) {
//             return d.data.label + ': ';
//           })
//           .on('mouseover', function(d, i) {
//             var gradient = gradients.filter(function( obj ) {
//               return obj.id == d.data.color;
//             });
//             $(chartId + ' [data-slice]').css('opacity', 0.5);
//             $(chartId + ' [data-slice=' + i + ']').css({
//               'background': gradient[0].end,
//               'opacity': 1
//             });
//           })
//           .on('mouseout', function(d, i) {
//             $(chartId + ' [data-slice]').css('opacity', 1);
//             $(chartId + ' [data-slice=' + i + ']').css('background', 'rgba(0,0,0,0.2)');
//           });

//     legend.append('span')
//       .text(function(d, i) {
//       return d.data.value + '%';
//     });

//     var maxCirc = d3.select(chartId)
//       .append('div')
//       .attr('class', 'max-circ');

//     maxCirc.append('span')
//       .attr('class', 'label')
//       .text(chartLabel);

//     maxCirc.append('span')
//       .attr('class', 'value')
//       .attr('style', function() {
//         var top = piedata.filter(function( obj ) {
//           return obj.value == max;
//         });
//         var gradient = gradients.filter(function( obj ) {
//           return obj.id == top[0].color;
//         });
//         return 'color: ' + gradient[0].end;
//       })
//       .text(function() {
//         var top = piedata.filter(function( obj ) {
//           return obj.value == max;
//         });
//         return top[0].label + ': ' + top[0].value + '%';
//       });
//   });
// });

// $(document).ready(function() {
//   $('[data-pie]').each(function() {
//     var chartId = '#' + $(this).attr('id');
//     var chartLabel = $(this).attr('data-pie-label');
//     var piedata = data[$(this).attr('data-pie')];
    
//     var width = 300,
//     height = 300,
//     radius = 140;

//     var pie = d3.layout.pie()
//       .value(function(d) {
//         return d.value;
//       })
//       .sort(null);

//     var arc = d3.svg.arc()
//       .outerRadius(radius)
//       .innerRadius(radius / 1.5);

//     var max = d3.max(piedata, function(d) { return +d.value;} );

//     var myChart = d3.select(chartId).append('svg')
//       .attr('width', width)
//       .attr('height', height)
//       .append('g')
//         .attr('transform', 'translate('+ (width / 2) +', '+ (height / 2) +')')
//         .selectAll('path').data(pie(piedata))
//         .enter().append('g')
//           .attr('class', function(d, i) {
//             var cssClass = 'slice';
//             if (d.data.value === max) {
//               cssClass += ' max';
//             }
//             return cssClass;
//           });

//     var gradient = d3.select(chartId + ' svg')
//       .selectAll('linearGradient').data(gradients)
//       .enter().append('linearGradient')
//         .attr('id', function(d, i) {
//           return gradients[i].id;
//         });

//     gradient.append('stop')
//       .attr('offset', '0%')
//       .attr('stop-color', function(d, i) {
//         return gradients[i].start;
//       });

//     gradient.append('stop')
//       .attr('offset', '100%')
//       .attr('stop-color', function(d, i) {
//         return gradients[i].end;
//       });

//     var slices = d3.selectAll(chartId + ' g.slice')
//       .append('path')
//         .attr('fill', function(d, i) {
//           return 'url(#' + d.data.color + ')';
//         })
//         .attr('d', arc)
//         .on('mouseover', function(d, i) {
//           var gradient = gradients.filter(function( obj ) {
//             return obj.id == d.data.color;
//           });
//           $(chartId + ' [data-slice]').css('opacity', 0.5);
//           $(chartId + ' [data-slice=' + i + ']').css({
//             'background': gradient[0].end,
//             'opacity': 1
//           });
//           d3.select(chartId + ' g.slice:nth-child(' + (i + 1) + ') path')
//             .transition()
//             .duration(200)
//             .attr('d', d3.svg.arc()
//               .outerRadius(radius + 10)
//               .innerRadius(radius / 1.5 + 10));
//         })
//         .on('mouseout', function(d, i) {
//           $(chartId + ' [data-slice]').css('opacity', 1);
//           $(chartId + ' [data-slice=' + i + ']').css('background', 'rgba(0,0,0,0.2)');
//           d3.select(chartId + ' g.slice:nth-child(' + (i + 1) + ') path')
//             .transition()
//             .duration(200)
//             .attr('d', d3.svg.arc()
//               .outerRadius(radius)
//               .innerRadius(radius / 1.5));
//         });

//     var legend = d3.select(chartId)
//       .attr('class', 'pie-chart')
//       .append('ul')
//         .attr('class', 'legend')
//         .selectAll('li').data(pie(piedata))
//         .enter().append('li')
//           .attr('data-slice', function(d, i) {
//             return i;
//           })
//           .attr('style', function(d, i) {
//             var gradient = gradients.filter(function( obj ) {
//               return obj.id == d.data.color;
//             });
//             return 'border-bottom: solid 3px ' + gradient[0].end;
//           })
//           .text(function(d, i) {
//             return d.data.label + ': ';
//           })
//           .on('mouseover', function(d, i) {
//             var gradient = gradients.filter(function( obj ) {
//               return obj.id == d.data.color;
//             });
//             $(chartId + ' [data-slice]').css('opacity', 0.5);
//             $(chartId + ' [data-slice=' + i + ']').css({
//               'background': gradient[0].end,
//               'opacity': 1
//             });
//             d3.select(chartId + ' g.slice:nth-child(' + (i + 1) + ') path')
//               .transition()
//               .duration(200)
//               .attr('d', d3.svg.arc()
//                 .outerRadius(radius + 10)
//                 .innerRadius(radius / 1.5 + 10));
//           })
//           .on('mouseout', function(d, i) {
//             $(chartId + ' [data-slice]').css('opacity', 1);
//             $(chartId + ' [data-slice=' + i + ']').css('background', 'rgba(0,0,0,0.2)');
//             d3.select(chartId + ' g.slice:nth-child(' + (i + 1) + ') path')
//               .transition()
//               .duration(200)
//               .attr('d', d3.svg.arc()
//                 .outerRadius(radius)
//                 .innerRadius(radius / 1.5));
//           });

//     legend.append('span')
//       .text(function(d, i) {
//       return d.data.value + '%';
//     });

//     var maxCirc = d3.select(chartId)
//       .append('div')
//       .attr('class', 'max-circ');

//     maxCirc.append('span')
//       .attr('class', 'label')
//       .text(chartLabel);

//     maxCirc.append('span')
//       .attr('class', 'value')
//       .attr('style', function() {
//         var top = piedata.filter(function( obj ) {
//           return obj.value == max;
//         });
//         var gradient = gradients.filter(function( obj ) {
//           return obj.id == top[0].color;
//         });
//         return 'color: ' + gradient[0].end;
//       })
//       .text(function() {
//         var top = piedata.filter(function( obj ) {
//           return obj.value == max;
//         });
//         return top[0].label + ': ' + top[0].value + '%';
//       });
//   });
// });

// $(document).ready(function() {
//   $('[data-pie]').each(function() {
//     var chartId = '#' + $(this).attr('id');
//     var chartLabel = $(this).attr('data-pie-label');
//     var piedata = data[$(this).attr('data-pie')];

//     var width = 300,
//       height = 300,
//       radius = 140;

//     var pie = d3.layout.pie()
//       .value(function(d) {
//         return d.value;
//       })
//       .sort(null);

//     var arc = d3.svg.arc()
//       .outerRadius(radius)
//       .innerRadius(radius / 1.5);

//     var max = d3.max(piedata, function(d) { return +d.value; });

//     var myChart = d3.select(chartId).append('svg')
//       .attr('width', width)
//       .attr('height', height)
//       .append('g')
//       .attr('transform', 'translate(' + (width / 2) + ', ' + (height / 2) + ')')
//       .selectAll('path').data(pie(piedata))
//       .enter().append('g')
//       .attr('class', function(d, i) {
//         var cssClass = 'slice';
//         if (d.data.value === max) {
//           cssClass += ' max';
//         }
//         return cssClass;
//       });

//     var gradient = d3.select(chartId + ' svg')
//       .selectAll('linearGradient').data(gradients)
//       .enter().append('linearGradient')
//       .attr('id', function(d, i) {
//         return gradients[i].id;
//       });

//     gradient.append('stop')
//       .attr('offset', '0%')
//       .attr('stop-color', function(d, i) {
//         return gradients[i].start;
//       });

//     gradient.append('stop')
//       .attr('offset', '100%')
//       .attr('stop-color', function(d, i) {
//         return gradients[i].end;
//       });

//     var slices = d3.selectAll(chartId + ' g.slice')
//       .append('path')
//       .attr('fill', function(d, i) {
//         return 'url(#' + d.data.color + ')';
//       })
//       .attr('d', arc)
//       .on('mouseover', function(d, i) {
//         var gradient = gradients.filter(function(obj) {
//           return obj.id == d.data.color;
//         });
//         $(chartId + ' [data-slice]').css('opacity', 0.5);
//         $(chartId + ' [data-slice=' + i + ']').css({
//           'background': gradient[0].end,
//           'opacity': 1
//         });
//         d3.select(chartId + ' g.slice:nth-child(' + (i + 1) + ') path')
//           .transition()
//           .duration(200)
//           .attr('d', d3.svg.arc()
//             .outerRadius(radius + 10)
//             .innerRadius(radius / 1.5 + 10));
//       })
//       .on('mouseout', function(d, i) {
//         $(chartId + ' [data-slice]').css('opacity', 1);
//         $(chartId + ' [data-slice=' + i + ']').css('background', 'rgba(0,0,0,0.2)');
//         d3.select(chartId + ' g.slice:nth-child(' + (i + 1) + ') path')
//           .transition()
//           .duration(200)
//           .attr('d', arc); // Revenir à la forme originale
//       });

//     var legend = d3.select(chartId)
//       .attr('class', 'pie-chart')
//       .append('ul')
//       .attr('class', 'legend')
//       .selectAll('li').data(pie(piedata))
//       .enter().append('li')
//       .attr('data-slice', function(d, i) {
//         return i;
//       })
//       .attr('style', function(d, i) {
//         var gradient = gradients.filter(function(obj) {
//           return obj.id == d.data.color;
//         });
//         return 'border-bottom: solid 3px ' + gradient[0].end;
//       })
//       .text(function(d, i) {
//         return d.data.label + ': ';
//       })
//       .on('mouseover', function(d, i) {
//         // Appliquer l'effet de survol du pie chart
//         var gradient = gradients.filter(function(obj) {
//           return obj.id == d.data.color;
//         });
//         $(chartId + ' [data-slice]').css('opacity', 0.5);
//         $(chartId + ' [data-slice=' + i + ']').css({
//           'background': gradient[0].end,
//           'opacity': 1
//         });
        
//         // Effet sur le pie chart
//         d3.select(chartId + ' g.slice:nth-child(' + (i + 1) + ') path')
//           .transition()
//           .duration(200)
//           .attr('d', d3.svg.arc()
//             .outerRadius(radius + 10)
//             .innerRadius(radius / 1.5 + 10));
//       })
//       .on('mouseout', function(d, i) {
//         // Restaurer l'état initial pour les tranches du pie chart
//         $(chartId + ' [data-slice]').css('opacity', 1);
//         $(chartId + ' [data-slice=' + i + ']').css('background', 'rgba(0,0,0,0.2)');
        
//         // Réinitialiser le pie chart
//         d3.select(chartId + ' g.slice:nth-child(' + (i + 1) + ') path')
//           .transition()
//           .duration(200)
//           .attr('d', arc); // Revenir à la forme originale
//       });

//     legend.append('span')
//       .text(function(d, i) {
//         return d.data.value + '%';
//       });

//     var maxCirc = d3.select(chartId)
//       .append('div')
//       .attr('class', 'max-circ');

//     maxCirc.append('span')
//       .attr('class', 'label')
//       .text(chartLabel);

//     maxCirc.append('span')
//       .attr('class', 'value')
//       .attr('style', function() {
//         var top = piedata.filter(function(obj) {
//           return obj.value == max;
//         });
//         var gradient = gradients.filter(function(obj) {
//           return obj.id == top[0].color;
//         });
//         return 'color: ' + gradient[0].end;
//       })
//       .text(function() {
//         var top = piedata.filter(function(obj) {
//           return obj.value == max;
//         });
//         return top[0].label + ': ' + top[0].value + '%';
//       });
//   });
// });
$(document).ready(function() {
  $('[data-pie]').each(function() {
    var chartId = '#' + $(this).attr('id');
    var chartLabel = $(this).attr('data-pie-label');
    var piedata = data[$(this).attr('data-pie')];

    var width = 300,
      height = 300,
      radius = 140;

    var pie = d3.layout.pie()
      .value(function(d) {
        return d.value;
      })
      .sort(null);

    var arc = d3.svg.arc()
      .outerRadius(radius)
      .innerRadius(radius / 1.5);

    var max = d3.max(piedata, function(d) { return +d.value; });

    var myChart = d3.select(chartId).append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', 'translate(' + (width / 2) + ', ' + (height / 2) + ')')
      .selectAll('path').data(pie(piedata))
      .enter().append('g')
      .attr('class', function(d, i) {
        var cssClass = 'slice';
        if (d.data.value === max) {
          cssClass += ' max';
        }
        return cssClass;
      });

    var gradient = d3.select(chartId + ' svg')
      .selectAll('linearGradient').data(gradients)
      .enter().append('linearGradient')
      .attr('id', function(d, i) {
        return gradients[i].id;
      });

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', function(d, i) {
        return gradients[i].start;
      });

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', function(d, i) {
        return gradients[i].end;
      });

    var slices = d3.selectAll(chartId + ' g.slice')
      .append('path')
      .attr('fill', function(d, i) {
        return 'url(#' + d.data.color + ')';
      })
      .attr('d', arc)
      .on('mouseover', function(d, i) {
        var gradient = gradients.filter(function(obj) {
          return obj.id == d.data.color;
        });

        // Appliquer les effets visuels sur le pie chart
        $(chartId + ' [data-slice]').css('opacity', 0.5);
        $(chartId + ' [data-slice=' + i + ']').css({
          'background': gradient[0].end,
          'opacity': 1
        });
      })
      .on('mouseout', function(d, i) {
        $(chartId + ' [data-slice]').css('opacity', 1);
        $(chartId + ' [data-slice=' + i + ']').css('background', 'rgba(0,0,0,0.2)');
      });

    var legend = d3.select(chartId)
      .attr('class', 'pie-chart')
      .append('ul')
      .attr('class', 'legend')
      .selectAll('li').data(pie(piedata))
      .enter().append('li')
      .attr('data-slice', function(d, i) {
        return i;
      })
      .attr('style', function(d, i) {
        var gradient = gradients.filter(function(obj) {
          return obj.id == d.data.color;
        });
        return 'border-bottom: solid 3px ' + gradient[0].end;
      })
      .text(function(d, i) {
        return d.data.label + ': ';
      })
      .on('mouseover', function(d, i) {
        // Appliquer les mêmes effets de survol que pour le pie chart
        var gradient = gradients.filter(function(obj) {
          return obj.id == d.data.color;
        });

        // Changer l'opacité des tranches lors du survol de la légende
        $(chartId + ' g.slice path').css('opacity', 0.5);
        $(chartId + ' g.slice:nth-child(' + (i + 1) + ') path').css('opacity', 1);

        // Ajouter la classe .max au slice correspondant
        $(chartId + ' g.slice').removeClass('max'); // Retirer la classe .max de tous les slices
        $(chartId + ' g.slice:nth-child(' + (i + 1) + ')').addClass('max'); // Ajouter la classe .max au slice survolé

        $(chartId + ' [data-slice]').css('opacity', 0.5);
        $(chartId + ' [data-slice=' + i + ']').css({
          'background': gradient[0].end,
          'opacity': 1
        });
      })
      .on('mouseout', function(d, i) {
        $(chartId + ' g.slice path').css('opacity', 1);
        $(chartId + ' [data-slice]').css('opacity', 1);
        $(chartId + ' [data-slice=' + i + ']').css('background', 'rgba(0,0,0,0.2)');

        // Retirer la classe .max lorsque la souris quitte l'élément de la légende
        $(chartId + ' g.slice').removeClass('max');
      });

    legend.append('span')
      .text(function(d, i) {
        return d.data.value + '%';
      });

    var maxCirc = d3.select(chartId)
      .append('div')
      .attr('class', 'max-circ');

    maxCirc.append('span')
      .attr('class', 'label')
      .text(chartLabel);

    maxCirc.append('span')
      .attr('class', 'value')
      .attr('style', function() {
        var top = piedata.filter(function(obj) {
          return obj.value == max;
        });
        var gradient = gradients.filter(function(obj) {
          return obj.id == top[0].color;
        });
        return 'color: ' + gradient[0].end;
      })
      .text(function() {
        var top = piedata.filter(function(obj) {
          return obj.value == max;
        });
        return top[0].label + ': ' + top[0].value + '%';
      });
  });
});
