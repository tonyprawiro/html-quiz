BookmarksObj = function() {
  this.QUESTIONS = new Array();
  this.STARTINGNUM = 10;
  this.QINDEX = 0;
  this.HTML5STORAGE = (typeof(Storage) !== "undefined");

  this.displayMoreQuestion = function() {

    s = "";
    s += '<div class="qset" id="set' + this.QUESTIONS[this.QINDEX]["Hash"] + '">';
    s += '<div class="question" id="question' + this.QUESTIONS[this.QINDEX]["Hash"] + '"></div>';
    s += '<div class="choices "id="choices' + this.QUESTIONS[this.QINDEX]["Hash"] + '"></div>';
    s += '<div class="answer" id="answer' + this.QUESTIONS[this.QINDEX]["Hash"] + '"></div>';
    s += '</div>';
    $('#infscroll').append(s);
    $('#set' + this.QUESTIONS[this.QINDEX]["Hash"]).fadeTo('fast', 0, function(){
      Q = BookmarksObj.QUESTIONS[BookmarksObj.QINDEX];
      sExtra = "";
      sExtra += "<br /><br /><p>";
      sExtra += '<button type="button" class="btn btn-primary" aria-label="Remove" onclick="BookmarksObj.removeFromBookmark(\'' + Q["Hash"] + '\')">';
      sExtra += '<span class="glyphicon glyphicon-trash" aria-hidden="true"></span> Remove from bookmark';
      sExtra += '</button>';
      sExtra += "</p>";
      $('#question' + Q["Hash"]).html(Q["Question"]);
      $('#choices' + Q["Hash"]).html(Q["Choices"]);
      $('#answer' + Q["Hash"]).html(Q["Answer"] + sExtra);
      $(this).fadeTo('fast', 1, function(){
        if(BookmarksObj.QINDEX==BookmarksObj.QUESTIONS.length) {
          BookmarksObj.displayNoQuestion();
        } else {
          BookmarksObj.QINDEX+=1;
          if(BookmarksObj.QINDEX<BookmarksObj.QUESTIONS.length && BookmarksObj.QINDEX<BookmarksObj.STARTINGNUM) {
            BookmarksObj.displayMoreQuestion();
          }
        }
      });
    });

  }

  this.removeFromBookmark = function(SHASH) {
    if(this.HTML5STORAGE && confirm("Remove this from bookmark ?")) {

      $('#set' + SHASH).fadeTo('fast', 0, function(){
        for(var i=0, RIDX=-1; i<BookmarksObj.QUESTIONS.length; i++) {
          if(BookmarksObj.QUESTIONS[i]["Hash"]==SHASH) {
            RIDX = i;
            break;
          }
        }
        BookmarksObj.QUESTIONS.splice(RIDX, 1);
        BookmarksObj.QINDEX = BookmarksObj.QINDEX - 1;
        totalRemoved+=1;
        QS = JSON.stringify(BookmarksObj.QUESTIONS);
        localStorage.setItem("SAVEDQUESTIONS", QS);
        $(this).remove();
        this.displayMoreQuestion();
      });
    }
  }

  this.displayNoQuestion = function() {
    $('#infscroll').append("End of list.");
  }

  this.start = function() {
    if(this.HTML5STORAGE) {
      QS = localStorage.getItem("SAVEDQUESTIONS");
      if(typeof(QS)!=="undefined" && QS!==null) {
        try {
          QS = JSON.parse(QS);
        } catch(err) {
          console.log(err.message);
        }
        if(QS.constructor==Array && QS.length>0) {
          this.QUESTIONS = QS;
          this.displayMoreQuestion();
        } else {
          this.displayNoQuestion();
        }
      } else {
        QS = new Array();
        localStorage.setItem("SAVEDQUESTIONS", QS);
      }
    }
  }

}


var BookmarksObj = new BookmarksObj();

var totalRemoved = 0;

BookmarksObj.start();

$(window).scroll(function(){
  if ($(document).height()-$(window).height()-$(this).scrollTop() == 0) {
    if(BookmarksObj.QINDEX < BookmarksObj.QUESTIONS.length) {
      BookmarksObj.displayMoreQuestion();
    }
  }
})
