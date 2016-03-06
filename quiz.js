shuffle = function(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

QuizObj = function() {
	this.QUESTIONS = new Array();
	this.RIGHT = 0;
	this.WRONG = 0;
	this.TOTAL = 0;
	this.PERCENTAGE = 0;
	this.QINDEX = 0;
	this.QNAME = "";
	this.HTML5STORAGE = (typeof(Storage) !== "undefined");

	this.parseQuizData = function(textData, resume) {
		TEMP = {}
		sMode = "";
		sQuestionNo = "";
		sQuestion = "";
		sChoices = "";
		sAnswer = "";
    sHash = "";
		lines = textData.split("\n");
		for(var i in lines) {

			line = lines[i];

			if(line.match('^QUESTION ')) {

				if(sQuestion != "" && sChoices != "" && sAnswer != "") {
					TEMP = {
            "Hash": sHash,
						"Question": sQuestion,
						"Choices": sChoices,
						"Answer": sAnswer
					}
					this.QUESTIONS.push(TEMP);
					sQuestion = "";
					sChoices = "";
					sAnswer = "";
          sHash = "";
				} else {

				}

				TEMP = {}
				sMode = "Question";
				sQuestion = line + "<br />";
				sQuestionNo = line.substr(8);
        sHash = md5(this.QNAME + sQuestionNo);
			}

			if(line.match('^A\\. ')) {
				sMode = "Choices";
			}

			if(line.match('^Correct Answer: ')) {
				sMode = "Answer";
			}

			if(sMode == "Question" && !line.match('^QUESTION ')) {
				sQuestion += line + " ";
			} else if(sMode == "Choices") {
				sChoices += line + "<br />";
			} else if(sMode == "Answer") {
				sAnswer += line;
				if(line.match('^Correct Answer: ')) {
					sAnswer += "<br />";
				} else {
					sAnswer += " ";
				}
			} else {

			}
	 	}

	 	if(this.QUESTIONS.length > 0) {
	 		this.TOTAL = this.QUESTIONS.length;
	 		if(!resume) {
		 		$('#q-total').html(this.QUESTIONS.length + "<!--" + this.QINDEX + "-->");
		 		$('#q-right').html('0');
		 		$('#q-wrong').html('0');
		 		$('#q-score').html('0 %');
		 		shuffle(this.QUESTIONS);
		 		this.nextQuestion();
		 		if(this.HTML5STORAGE) {
		 			localStorage.setItem("QNAME", this.QNAME)
		 			localStorage.setItem("QUESTIONS", JSON.stringify(this.QUESTIONS));
		 			localStorage.setItem("TOTAL", this.TOTAL);
		 			localStorage.setItem("RIGHT", this.RIGHT);
		 			localStorage.setItem("WRONG", this.WRONG);
		 			localStorage.setItem("PERCENTAGE", this.PERCENTAGE);
		 			localStorage.setItem("QINDEX", this.QINDEX);
		 		}
	 		}
	 	}
	}

  this.getButton = function(name) {
    s = "";
    if(name=="start over") {
      s += '<button type="button" class="btn btn-warning btn-xs" aria-label="Start Over" onclick="Quiz.startOver()">';
      s += '<span class="glyphicon glyphicon-off" aria-hidden="true"></span> Start over';
      s += '</button>';
    } else if(name=="bookmark") {
      s += '<button type="button" class="btn btn-info" aria-label="Save">';
      s += '<span class="glyphicon glyphicon-bookmark" aria-hidden="true"></span> Bookmark';
      s += '</button>';
    } else if(name=="right") {
      s += '<button type="button" class="btn btn-success" aria-label="Save" onclick="Quiz.gotRight()">';
      s += '<span class="glyphicon glyphicon-ok" aria-hidden="true"></span> I got this wright';
      s += '</button>';
    } else if(name=="wrong") {
      s += '<button type="button" class="btn btn-danger" aria-label="Wrong" onclick="Quiz.gotWrong()">';
      s += '<span class="glyphicon glyphicon-remove" aria-hidden="true"></span> I got this wrong';
      s += '</button>';
    } else if(name=="reveal") {
      s += '<button type="button" class="btn btn-primary" aria-label="Reval" onclick="Quiz.revealAnswer()">';
      s += '<span class="glyphicon glyphicon-folder-open" aria-hidden="true"></span> &nbsp;Reveal answer';
      s += '</button>';
    }
    return s;
  }

  this.getSeparator = function() {
    return "&nbsp;&nbsp;&nbsp;";
  }

	this.loadQuiz = function() {
		url = $('#url').val();
		key = $('#key').val();
		$.ajax(url, {
			success: function(data){
				textData = "";
				try {
					textData = justDecrypt(data, key);
				} catch(err) {
					alert("Invalid decryption key");
				}
				if(textData.length > 0) {
					Quiz.parseQuizData(textData, false);
					$('#url option').each(function(){
						if($(this).attr('value') == $('#url').val()) {
							$('#q-name').html($(this).html() + Quiz.getButton("start over"));
							if(Quiz.HTML5STORAGE) {
								localStorage.setItem("QNAME", $(this).html());
							}
						}
					})
					$('#quiz-interface-div').hide();
				}
			}
		});
	}

	this.nextQuestion = function() {
		this.displayQuestion(this.pickRandomQuestion())
	}

	this.displayQuestion = function(num) {

		$('#question').fadeTo("fast", 0.1, function(){
			$(this).html("");
			$('#question').fadeTo("fast", 1, function(){
        sExtra = "";
        if(Quiz.HTML5STORAGE) {
          if(!Quiz.inSavedQuestions()) {
            sExtra += '<p id="bookmark-btn" style="height: 30px;" onclick="Quiz.bookmarkQuestion()">' + Quiz.getButton("bookmark") + '</p>';
          } else {
            sExtra += '<p id="bookmark-btn" style="height: 30px;"><span class="glyphicon glyphicon-bookmark" aria-hidden="true"></span> Question already bookmarked</p>';
          }
        }
				$(this).html(sExtra + Quiz.QUESTIONS[Quiz.QINDEX]['Question'])
			});
		});
		$('#choices').fadeTo("fast", 0.1, function() {
			$(this).html("");
			$('#choices').fadeTo("fast", 1, function(){
				$(this).html(Quiz.QUESTIONS[Quiz.QINDEX]['Choices'])
			});
		});
		$('#answer').fadeTo("fast", 0.1, function(){
			$(this).html("");
			$('#answer').fadeTo("fast", 1, function(){
				$(this).html(Quiz.getButton("reveal"))
			});
		});

    $('.qset').css('display', 'block');
	}

	this.calcTally = function() {
		$('#btn-right').attr("disabled", "disabled");
		$('#btn-wrong').attr("disabled", "disabled");
		if(this.RIGHT + this.WRONG > 0) {
			this.PERCENTAGE = Math.floor(this.RIGHT * 100 / (this.RIGHT + this.WRONG))
		} else {
			this.PERCENTAGE = 0;
		}

 		$('#q-total').html(this.QUESTIONS.length + "<!--" + this.QINDEX + "-->");
		$('#q-right').html(this.RIGHT);
		$('#q-wrong').html(this.WRONG);
		$('#q-score').html(this.PERCENTAGE + ' %');
		this.nextQuestion();
 		if(this.HTML5STORAGE) {
 			localStorage.setItem("RIGHT", this.RIGHT);
 			localStorage.setItem("WRONG", this.WRONG);
 			localStorage.setItem("PERCENTAGE", this.PERCENTAGE);
 			localStorage.setItem("QINDEX", this.QINDEX);
 		}
	}

	this.gotRight = function() {
		this.RIGHT += 1;
		this.calcTally();
	}

	this.gotWrong = function() {
		this.WRONG += 1;
		this.calcTally();
	}

	this.inSavedQuestions = function() {
    var result = false;
    if(this.HTML5STORAGE) {
      QS = localStorage.getItem("SAVEDQUESTIONS");
      if(typeof(QS)!=="undefined" && QS!==null) {
        try{
          QS = JSON.parse(QS);
        } catch(err) {
          console.log(err.message);
        }
        if(QS.constructor==Array && QS.length>0) {
          for(var i = 0; i<QS.length; i++) {
            if(QS[i]["Hash"]==this.QUESTIONS[this.QINDEX]["Hash"]) {
              result = true;
            }
          }
        }
      }
    }
    return result;
	}

  this.bookmarkQuestion = function() {
    if(this.HTML5STORAGE) {

      QS = localStorage.getItem("SAVEDQUESTIONS");
      if(typeof(QS)!=="undefined" && QS!==null) {
        try {
          QS = JSON.parse(QS);
        } catch(err) {
          console.log(err.message);
        }
        if(QS.constructor==Array) {
          console.log("Add into bookmark");
          QS.push(this.QUESTIONS[this.QINDEX]);
          localStorage.setItem("SAVEDQUESTIONS", JSON.stringify(QS));
        } else {
          console.log("Create new bookmark");
          QS = new Array();
          QS.push(this.QUESTIONS[this.QINDEX]);
          localStorage.setItem("SAVEDQUESTIONS", JSON.stringify(QS));
        }
      } else {
        console.log("QS is undefined or null")
        QS = new Array();
        QS.push(this.QUESTIONS[this.QINDEX]);
        localStorage.setItem("SAVEDQUESTIONS", JSON.stringify(QS));
      }

      $('#bookmark-btn').fadeTo("fast", 0.1, function(){
        $(this).html("&nbsp;");
        $('#bookmark-btn').fadeTo("fast", 1, function(){
          $(this).html('<span class="glyphicon glyphicon-bookmark" aria-hidden="true"></span> Question has been bookmarked');
        });
      });
    }
  }

	this.revealAnswer = function() {
		$('#answer').fadeTo("fast", 0, function() {
			$(this).html("");
			$('#answer').fadeTo("fast", 1, function() {
        sExtra = "";
        sExtra += "<br /><br />";
        sExtra += "<br />";
        sExtra += Quiz.getButton("right");
        sExtra += Quiz.getSeparator();
        sExtra += Quiz.getButton("wrong");
				$('#answer').html(Quiz.QUESTIONS[Quiz.QINDEX]['Answer'] + sExtra);
			});
		});
	}

	this.pickRandomQuestion = function() {
		this.QINDEX += 1;
		if(this.QINDEX > this.QUESTIONS.length-1) {
			//shuffle(this.QUESTIONS);
			this.QINDEX = 0;
		}
		if(this.HTML5STORAGE) {
			localStorage.setItem("QINDEX", this.QINDEX);
		}
		return this.QINDEX;
	}

	this.startOver = function() {
		if(confirm("Start over the quiz ? You will lose the current progress.")) {
	 		if(this.HTML5STORAGE) {
	 			localStorage.setItem("QUESTIONS", "[]");
	 			localStorage.setItem("QNAME", "");
	 			localStorage.setItem("TOTAL", 0);
	 			localStorage.setItem("RIGHT", 0);
	 			localStorage.setItem("WRONG", 0);
	 			localStorage.setItem("PERCENTAGE", 0);
	 			localStorage.setItem("QINDEX", 0);
	 		}
	 		location.reload();
		}
	}

	this.canContinueQuiz = function() {
 		return this.HTML5STORAGE
      && typeof(localStorage.getItem("QUESTIONS"))!=="undefined"
      && localStorage.getItem("QUESTIONS")!==null
      && localStorage.getItem("QUESTIONS").length > 0;
	}

	this.continueQuiz = function() {
 		if(this.HTML5STORAGE) {

			$('#q-name').html(localStorage.getItem("QNAME") + " " + this.getButton("start over"));
      X = new Array();
      try {
        X = JSON.parse(localStorage.getItem("QUESTIONS"));
      } catch (err) {

      }
 			this.QUESTIONS = X;
 			this.TOTAL = parseInt(localStorage.getItem("TOTAL"));
 			this.RIGHT = parseInt(localStorage.getItem("RIGHT"));
 			this.WRONG = parseInt(localStorage.getItem("WRONG"));
 			this.PERCENTAGE = parseInt(localStorage.getItem("PERCENTAGE"));
 			this.QINDEX = parseInt(localStorage.getItem("QINDEX"));

	 		$('#q-total').html(this.QUESTIONS.length + "<!--" + this.QINDEX + "-->");
			$('#q-right').html(this.RIGHT);
			$('#q-wrong').html(this.WRONG);
			$('#q-score').html(this.PERCENTAGE + ' %');
			$('#quiz-interface-div').hide();
 			this.displayQuestion(this.QINDEX);
 		}
	}

}

var Quiz = new QuizObj();
if(Quiz.canContinueQuiz()) {
	if(confirm("Resume previous session ?")) {
		Quiz.continueQuiz();
	}
}
