document.addEventListener("DOMContentLoaded", function () {
  const snowContainer = document.querySelector(".snow");
  const numberOfFlakes = 50; // Nombre de flocons de neige que vous voulez

  for (let i = 0; i < numberOfFlakes; i++) {
    const snowflake = document.createElement("div");
    snowflake.classList.add("snowflake");

    // Définir les propriétés CSS avec des variables pour chaque flocon
    const size = Math.random() * 10 + 5 + "px"; // Taille entre 5px et 15px
    const duration = Math.random() * 10 + 5 + "s"; // Durée entre 5s et 15s
    const opacity = Math.random() * 0.5 + 0.5; // Opacité entre 0.5 et 1
    const leftPosition = Math.random() * 100 + "%"; // Position horizontale aléatoire
    const delay = Math.random() * 5 + "s"; // Délai d'apparition entre 0s et 5s

    snowflake.style.setProperty("--size", size);
    snowflake.style.setProperty("--duration", duration);
    snowflake.style.setProperty("--opacity", opacity);
    snowflake.style.setProperty("--delay", delay); // Ajoute le délai
    snowflake.style.left = leftPosition;

    snowContainer.appendChild(snowflake);
  }
});

!(function ($) {
  "use strict";

  var Typed = function (el, options) {
    // Élément choisi pour manipuler le texte
    this.el = $(el);

    // Options
    this.options = $.extend({}, $.fn.typed.defaults, options);

    // Attribut à taper
    this.isInput = this.el.is("input");
    this.attr = this.options.attr;

    // Afficher le curseur
    this.showCursor = this.isInput ? false : this.options.showCursor;

    // Contenu textuel de l'élément
    this.elContent = this.attr ? this.el.attr(this.attr) : this.el.text();

    // HTML ou texte brut
    this.contentType = this.options.contentType;

    // Vitesse de frappe
    this.typeSpeed = this.options.typeSpeed;

    // Ajouter un délai avant de commencer à taper
    this.startDelay = this.options.startDelay;

    // Vitesse de suppression
    this.backSpeed = this.options.backSpeed;

    // Temps d'attente avant de supprimer
    this.backDelay = this.options.backDelay;

    // Div contenant les chaînes de caractères
    this.stringsElement = this.options.stringsElement;

    // Chaînes de texte à taper
    this.strings = this.options.strings;

    // Position du caractère actuel dans la chaîne
    this.strPos = 0;

    // Position actuelle dans le tableau
    this.arrayPos = 0;

    // Nombre de caractères à arrêter de supprimer
    this.stopNum = 0;

    // Logique de boucle
    this.loop = this.options.loop;
    this.loopCount = this.options.loopCount;
    this.curLoop = 0;

    // Pour arrêter
    this.stop = false;

    // Curseur personnalisé
    this.cursorChar = this.options.cursorChar;

    // Mélanger les chaînes
    this.shuffle = this.options.shuffle;
    // L'ordre des chaînes
    this.sequence = [];

    // Tout est prêt !
    this.build();
  };

  Typed.prototype = {
    constructor: Typed,

    init: function () {
      // Commencer la boucle avec la première chaîne actuelle (self.strings global)
      // La chaîne actuelle sera passée en argument à chaque fois après cela
      var self = this;
      self.timeout = setTimeout(function () {
        for (var i = 0; i < self.strings.length; ++i) self.sequence[i] = i;

        // Mélanger le tableau si vrai
        if (self.shuffle) self.sequence = self.shuffleArray(self.sequence);

        // Commencer à taper
        self.typewrite(self.strings[self.sequence[self.arrayPos]], self.strPos);
      }, self.startDelay);
    },

    build: function () {
      var self = this;
      // Insérer le curseur
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

    // Passer l'état actuel de la chaîne à chaque fonction, taper 1 caractère par appel
    typewrite: function (curString, curStrPos) {
      // Sortir quand arrêté
      if (this.stop === true) {
        return;
      }

      // Valeurs variables pour setTimeout pendant la frappe
      // Ne peut pas être global car le nombre change à chaque exécution de la boucle
      var humanize = Math.round(Math.random() * (100 - 30)) + this.typeSpeed;
      var self = this;

      // Contenir la fonction de frappe dans un délai humanisé
      self.timeout = setTimeout(function () {
        // Vérifier un caractère d'échappement avant une valeur de pause
        // Format: \^\d+ .. ex: ^1000 .. devrait pouvoir imprimer le ^ aussi en utilisant ^^
        // Les ^ simples sont supprimés de la chaîne
        var charPause = 0;
        var substr = curString.substr(curStrPos);
        if (substr.charAt(0) === "^") {
          var skip = 1; // Sauter au moins 1
          if (/^\^\d+/.test(substr)) {
            substr = /\d+/.exec(substr)[0];
            skip += substr.length;
            charPause = parseInt(substr);
          }

          // Supprimer le caractère d'échappement et la valeur de pause pour qu'ils ne soient pas imprimés
          curString =
            curString.substring(0, curStrPos) +
            curString.substring(curStrPos + skip);
        }

        if (self.contentType === "html") {
          // Sauter les balises HTML pendant la frappe
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

        // Délai pour toute pause après un caractère
        self.timeout = setTimeout(function () {
          if (curStrPos === curString.length) {
            // Déclenche la fonction de rappel
            self.options.onStringTyped(self.arrayPos);

            // Est-ce la dernière chaîne
            if (self.arrayPos === self.strings.length - 1) {
              // Animation qui se produit sur la dernière chaîne tapée
              self.options.callback();

              self.curLoop++;

              // Quitter si nous ne revenons pas en boucle
              if (self.loop === false || self.curLoop === self.loopCount)
                return;
            }

            self.timeout = setTimeout(function () {
              self.backspace(curString, curStrPos);
            }, self.backDelay);
          } else {
            /* Appeler les fonctions avant si applicable */
            if (curStrPos === 0) self.options.preStringTyped(self.arrayPos);

            // Commencer à taper chaque nouveau caractère dans la chaîne existante
            // curString: arg, self.el.html: texte original à l'intérieur de l'élément
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

            // Ajouter les caractères un par un
            curStrPos++;
            // Boucler la fonction
            self.typewrite(curString, curStrPos);
          }
          // Fin de la pause de caractère
        }, charPause);

        // Valeur humanisée pour la frappe
      }, humanize);
    },

    backspace: function (curString, curStrPos) {
      // Sortir quand arrêté
      if (this.stop === true) {
        return;
      }

      // Valeurs variables pour setTimeout pendant la frappe
      // Ne peut pas être global car le nombre change à chaque exécution de la boucle
      var humanize = Math.round(Math.random() * (100 - 30)) + this.backSpeed;
      var self = this;

      self.timeout = setTimeout(function () {
        if (self.contentType === "html") {
          // Sauter les balises HTML pendant la suppression
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

        // Remplacer le texte par le texte de base + les caractères tapés
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

        // Si le nombre (id du caractère dans la chaîne actuelle) est
        // inférieur au nombre d'arrêt, continuer
        if (curStrPos > self.stopNum) {
          // Soustraire les caractères un par un
          curStrPos--;
          // Boucler la fonction
          self.backspace(curString, curStrPos);
        }
        // Si le nombre d'arrêt a été atteint, augmenter
        // la position du tableau à la chaîne suivante
        else if (curStrPos <= self.stopNum) {
          self.arrayPos++;

          if (self.arrayPos === self.strings.length) {
            self.arrayPos = 0;

            // Mélanger à nouveau la séquence
            if (self.shuffle) self.sequence = self.shuffleArray(self.sequence);

            self.init();
          } else
            self.typewrite(
              self.strings[self.sequence[self.arrayPos]],
              curStrPos
            );
        }

        // Valeur humanisée pour la frappe
      }, humanize);
    },
    /**
     * Mélange les nombres dans le tableau donné.
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
    // Réinitialiser et reconstruire l'élément
    reset: function () {
      var self = this;
      clearInterval(self.timeout);
      var id = this.el.attr("id");
      this.el.after('<span id="' + id + '"/>');
      this.el.remove();
      if (typeof this.cursor !== "undefined") {
        this.cursor.remove();
      }
      // Envoyer le rappel
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
    // vitesse de frappe
    typeSpeed: 0,
    // délai avant de commencer à taper
    startDelay: 0,
    // vitesse de suppression
    backSpeed: 0,
    // mélanger les chaînes
    shuffle: false,
    // délai avant de supprimer
    backDelay: 500,
    // boucle
    loop: false,
    // false = infini
    loopCount: false,
    // afficher le curseur
    showCursor: true,
    // caractère pour le curseur
    cursorChar: "|",
    // attribut à taper (null == texte)
    attr: null,
    // soit html soit texte
    contentType: "html",
    // fonction de rappel quand terminé
    callback: function () {},
    // fonction de rappel avant chaque chaîne
    preStringTyped: function () {},
    // fonction de rappel pour chaque chaîne tapée
    onStringTyped: function () {},
    // fonction de rappel pour réinitialiser
    resetCallback: function () {},
  };
})(window.jQuery);

$("document").ready(function () {
  handleEscKey();
  handleTyping();
});

// LORSQU'ON APPUIE SUR ÉCHAP, on retourne au "sidebar"
function handleEscKey() {
  $(document).on("keyup", function (e) {
    if (e.keyCode === 27) {
      $("html, body").animate(
        {
          scrollTop: 0,
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

nouveau js

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

// Mettre en surbrillance le menu supérieur lors du défilement
$("body").scrollspy({
  target: ".navbar-fixed-top",
});

// Fermer le menu réactif lors du clic sur un élément de menu
$(".navbar-collapse ul li a").click(function () {
  $(".navbar-toggle:visible").click();
});
/*
  graphique en secteurs
*/

var gradients = [
  { id: "pink", start: "#b34f53", end: "#dd5b59" },
  { id: "pinkAssessFirst", start: "#FF2F92", end: "#FF73B2" },
  { id: "blue", start: "#095a82", end: "#0170a7" },
  { id: "blueAssessFirst", start: "#0096FF", end: "#66B8FF" },
  { id: "blueClairAssessFirst", start: "#80CAFF", end: "#B3E0FF" },
  { id: "red", start: "#874d2a", end: "#a55724" },
  { id: "green", start: "#5b7964", end: "#869d8d" },
  { id: "greenAssessFirst", start: "#52A003", end: "#8ACC55" },
  { id: "aqua", start: "#3f6071", end: "#588094" },
  { id: "yellowAssessFirst", start: "#F8BC4D", end: "#FFD68A" },
  { id: "orangeAssessFirst", start: "#F06F38", end: "#FFA573" },
  { id: "greyAssessFirst", start: "#CDD1D6", end: "#E4E6E9" },
  { id: "brown", start: "#8E5C42", end: "#D7B09E" },
  { id: "purple", start: "#7E57C2", end: "#B49DD5" },
  { id: "other", start: "#2272ad", end: "#308cd0" },
];

var data = [];

data["piedata"] = [
  { label: "Rigueur", value: 25, color: "blueAssessFirst" },
  { label: "Empathie", value: 27, color: "greenAssessFirst" },
  { label: "Créativité", value: 24, color: "red" },
  { label: "Management", value: 24, color: "pinkAssessFirst" },
];

data["piedata2"] = [
  { label: "Dynamisme", value: 45, color: "greenAssessFirst" },
  { label: "Stabilité", value: 55, color: "blueAssessFirst" },
];
data["piedata3"] = [
  { label: "Approfondir", value: 18, color: "other" },
  { label: "Innover", value: 35, color: "orangeAssessFirst" },
  { label: "Experimenter", value: 33, color: "blueAssessFirst" },
  { label: "Appliquer", value: 15, color: "purple" },
];

$(document).ready(function () {
  $("[data-pie]").each(function () {
    var chartId = "#" + $(this).attr("id");
    var chartLabel = $(this).attr("data-pie-label");
    var piedata = data[$(this).attr("data-pie")];

    var width = 300,
      height = 300,
      radius = 140;

    var pie = d3.layout
      .pie()
      .value(function (d) {
        return d.value;
      })
      .sort(null);

    var arc = d3.svg
      .arc()
      .outerRadius(radius)
      .innerRadius(radius / 1.5);

    var max = d3.max(piedata, function (d) {
      return +d.value;
    });

    var myChart = d3
      .select(chartId)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(" + width / 2 + ", " + height / 2 + ")")
      .selectAll("path")
      .data(pie(piedata))
      .enter()
      .append("g")
      .attr("class", function (d, i) {
        var cssClass = "slice";
        if (d.data.value === max) {
          cssClass += " max";
        }
        return cssClass;
      });

    // Définir les URLs
    var sliceUrl =
      "https://my.assessfirst.com/public/profile/rygldn4t-jeremy-huleux?lang=fr-FR"; // URL pour les tranches
    var legendUrl =
      "https://my.assessfirst.com/public/profile/rygldn4t-jeremy-huleux?lang=fr-FR"; // URL pour la légende

    $(document).ready(function () {
      // Ajouter un événement click pour rediriger vers un lien sur les tranches
      $(chartId + " g.slice").on("click", function () {
        window.open(sliceUrl, "_blank"); // Ouvre l'URL dans un nouvel onglet
      });

      // Ajouter un événement click pour rediriger vers un lien sur la légende
      $(chartId + " .legend li").on("click", function () {
        window.open(sliceUrl, "_blank"); // Ouvre l'URL dans un nouvel onglet
      });
    });

    var gradient = d3
      .select(chartId + " svg")
      .selectAll("linearGradient")
      .data(gradients)
      .enter()
      .append("linearGradient")
      .attr("id", function (d, i) {
        return gradients[i].id;
      });

    gradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", function (d, i) {
        return gradients[i].start;
      });

    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", function (d, i) {
        return gradients[i].end;
      });

    var slices = d3
      .selectAll(chartId + " g.slice")
      .append("path")
      .attr("fill", function (d, i) {
        return "url(#" + d.data.color + ")";
      })
      .attr("d", arc)
      .on("mouseover", function (d, i) {
        var gradient = gradients.filter(function (obj) {
          return obj.id == d.data.color;
        });

        // Appliquer les effets visuels sur le pie chart
        $(chartId + " [data-slice]").css("opacity", 0.5);
        $(chartId + " [data-slice=" + i + "]").css({
          background: gradient[0].end,
          opacity: 1,
        });
      })
      .on("mouseout", function (d, i) {
        $(chartId + " [data-slice]").css("opacity", 1);
        $(chartId + " [data-slice=" + i + "]").css(
          "background",
          "rgba(0,0,0,0.5)"
        );
      });

    var legend = d3
      .select(chartId)
      .attr("class", "pie-chart")
      .append("ul")
      .attr("class", "legend")
      .selectAll("li")
      .data(pie(piedata))
      .enter()
      .append("li")
      .attr("data-slice", function (d, i) {
        return i;
      })
      .attr("style", function (d, i) {
        var gradient = gradients.filter(function (obj) {
          return obj.id == d.data.color;
        });
        return "border-bottom: solid 3px " + gradient[0].end;
      })
      .text(function (d, i) {
        return d.data.label + ": ";
      })
      // Mouseover sur la légende
      .on("mouseover", function (d, i) {
        // Appliquer les mêmes effets de survol que pour le pie chart
        var gradient = gradients.filter(function (obj) {
          return obj.id == d.data.color;
        });

        // Changer l'opacité des tranches lors du survol de la légende
        $(chartId + " g.slice path").css("opacity", 0.5);
        $(chartId + " g.slice:nth-child(" + (i + 1) + ") path").css(
          "opacity",
          1
        );
        // Changer la couleur de fond des tranches lors du survol de la légende
        $(chartId + " [data-slice]").css("opacity", 0.5);
        $(chartId + " [data-slice=" + i + "]").css({
          background: gradient[0].end,
          opacity: 1,
          cursor: "pointer",
        });

        // Appliquer les effets visuels sur le pie chart
        d3.select(chartId + " g.slice:nth-child(" + (i + 1) + ") path").each(
          function () {
            // Vérifier si l'élément n'a pas la classe 'max'
            if (!d3.select(this.parentNode).classed("max")) {
              // Si l'élément n'a pas la classe 'max', appliquer la transformation scale
              d3.select(this)
                .transition()
                .duration(200)
                .attr("transform", "scale(1.05)");
            }
          }
        );
      })
      .on("mouseout", function (d, i) {
        $(chartId + " [data-slice]").css("opacity", 1);
        $(chartId + " [data-slice=" + i + "]").css(
          "background",
          "rgba(0,0,0,0.5)"
        );
      });

    legend.append("span").text(function (d, i) {
      return d.data.value + "%";
    });

    var maxCirc = d3.select(chartId).append("div").attr("class", "max-circ");

    maxCirc.append("span").attr("class", "label").text(chartLabel);

    maxCirc
      .append("span")
      .attr("class", "value")
      .attr("style", function () {
        var top = piedata.filter(function (obj) {
          return obj.value == max;
        });
        var gradient = gradients.filter(function (obj) {
          return obj.id == top[0].color;
        });
        return "color: " + gradient[0].end;
      })
      .text(function () {
        var top = piedata.filter(function (obj) {
          return obj.value == max;
        });
        return top[0].label + ": " + top[0].value + "%";
      });
  });
});
