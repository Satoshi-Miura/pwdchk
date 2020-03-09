/*!
 * jQuery.pwdMeasure
 * jQuery plugin to measure the strength of the password.
 * @version 1.0.5
 * @author tsuyoshiwada
 * @license MIT
 */
String.prototype.strReverse = function() {
    var newstring = "";
    for (var s=0; s < this.length; s++) {
        newstring = this.charAt(s) + newstring;
    }
    return newstring;
};
;(function(factory){
  "use strict";

  // AMD
  /*global define */
  if( typeof define === "function" && define.amd ){
    define(["jquery"], factory);

  // CommonJS
  }else if( typeof exports === "object" ){
    module.exports = factory(require("jquery"));

  // Default (browser)
  }else{
    factory(jQuery);
  }


}(function($){
  "use strict";

  var VERSION = "1.0.5",

      DATA_KEY = "pwdMeasure",

      MAX_CHAR = 14,

      Status = {
        VALID    : 1,
        INVALID  : 2,
        NOT_MATCH: 3,
        EMPTY    : 4
      },

      labelObjDefault = {
        score    : 100,
        label    : "",
        className: ""
      },

      // Default Options
      defaults = {
        minScore: 60,
        minLength: 10,
        events: "keyup change",
        labels: [
          {score:20,         label:"とても弱い (不合格)", className:"very-weak"},   //0~20%
          {score:40,         label:"弱い (不合格)",       className:"weak"},        //21~40%
          {score:60,         label:"やや弱い (条件付き合格)",       className:"average"},     //41~60%
          {score:80,         label:"強い (合格)",       className:"strong"},      //61~80%
          {score:100,        label:"とても強い (合格)", className:"very-strong"}, //81~100%
          {score:"notMatch", label:"不一致",     className:"not-match"},   //not match
          {score:"empty",    label:"未入力",     className:"empty"}        //empty
        ],
        indicator: "#pm-indicator",
        indicatorTemplate: "パスワード強度: <%= label %>",
        confirm: false,

        // Callbacks
        onValid: false,
        onInvalid: false,
        onNotMatch: false,
        onEmpty: false,
        onChangeState: false,
        onChangeValue: false
      },
      // Add S.Miura
      nSeqChar  = 0,
      nRepChar  = 0,
      sAlphas   = "abcdefghijklmnopqrstuvwxyzabc",
      sNumerics = "0123456789012",
      sTmpChar  = "",
      nMaxRep   = 0,

      // Namespace
      ns = "pm";



  // ===============================================================
  // Instance
  // ===============================================================
  function PwdMeasure(){
    this._initialize.apply(this, arguments);
  }

  // prototype Alias.
  PwdMeasure.fn = PwdMeasure.prototype;


  /**
   * Initialization of PwdMeausre instance.
   * @param jQueryObj
   * @param object
   * @return void
   */
  PwdMeasure.fn._initialize = function($elem, options){
    this.version = VERSION;
    this.eventName = "";
    this.percentage = 0;
    this.chars = {
      numbers: [],
      upperLetters: [],
      lowerLetters: [],
      specialChars: []
    };
    this.status = Status.INVALID;
    this.currentLabelObj = {};

    this.options = options;
    this.options.labels = $.map(this.options.labels, function(labelObj){
      return $.extend(true, {}, labelObjDefault, labelObj);
    });

    var i;
    for( i = 48; i < 58; i++ ) this.chars.numbers.push(i);
    for( i = 65; i < 91; i++ ) this.chars.upperLetters.push(i);
    for( i = 97; i < 123; i++ ) this.chars.lowerLetters.push(i);
    for( i = 32; i < 48; i++ ) this.chars.specialChars.push(i);
    for( i = 58; i < 65; i++ ) this.chars.specialChars.push(i);
    for( i = 91; i < 97; i++ ) this.chars.specialChars.push(i);
    for( i = 123; i < 127; i++ ) this.chars.specialChars.push(i);

    this.$elem = $elem;
    this.$indicator = $(this.options.indicator);
    this.$confirm = $(this.options.confirm);

    if( this.$indicator.size() > 0 ){
      this.indicatorDefaultHtml = this.$indicator.html();
    }

    this.update(true);
    this._bindMethods();
  };

  /**
   * Seek strength from the current value.
   * @return void
   */
  PwdMeasure.fn.calc = function(){
    var point = 0,
        found = {
          numbers: 0,
          upperLetters: 0,
          lowerLetters: 0,
          specialChars: 0
        },
        sTmpChar = "",
        preNumber  = "X",
        preULetter = "1",
        preLLetter = "1",
        preSpeChar = "X",
        nRepChar = 0,
        nMaxRep  = 0,
        nSeqChar = 0,
        txt = this.$elem.val(),
        i, s, x;

    if (txt.length >= this.options.minLength) {
      point += 40; /* Offset weak value */
    }

    if (txt.length >= this.options.minLength) {
        if (txt.length <= MAX_CHAR) {
          point += 5 * (txt.length - this.options.minLength);
        } else {
          point += 5 * (MAX_CHAR - this.options.minLength);
        }
    }

    for( i = 0; i < txt.length; i++ ){

      x = txt.charAt(i);
      s = ord(x);

      /* Check repeated character */
      if (sTmpChar !== "" ) {
        if (s == sTmpChar) { nRepChar++; } else { nRepChar = 0; }
      }
      if (nMaxRep < nRepChar) nMaxRep = nRepChar;
      sTmpChar = s;

      if( $.inArray(s, this.chars.numbers) !== -1 && found.numbers < 2 ){
        if (x !== preNumber) {
          found.numbers++;
          point += 7;
        }
        preNumber = x;
        continue;
      }
      if( $.inArray(s, this.chars.upperLetters) !== -1 && found.upperLetters < 2 ){
        if (x !== preULetter) {
          found.upperLetters++;
          point += 6;
        }
        preULetter = x;
        continue;
      }
      if( $.inArray(s, this.chars.lowerLetters) !== -1 && found.lowerLetters < 2 ){
        if (x !== preLLetter) {
          found.lowerLetters++;
          point += 5;
        }
        preLLetter = x;
        continue;
      }
      if( $.inArray(s, this.chars.specialChars) !== -1 && found.specialChars < 2 ){
        if (x !== preSpeChar) {
          found.specialChars++;
          point += 7;
        }
        preSpeChar = x;
        continue;
      }
    }

    if (found.numbers      == 0) point = Math.floor(point * 0.5);
    if (found.upperLetters == 0) point = Math.floor(point * 0.5);
    if (found.lowerLetters == 0) point = Math.floor(point * 0.5);
    if (found.specialChars == 0) point = Math.floor(point * 0.5);

    // NG words
    if (txt.match(/^.*(admin|root|password|qwerty)/i)) point = 0;
    if (txt.match(/^.*(service|backup|user|client)/i)) point = 0;
    if (txt.match(/^.*(server|group|anonym|sales)/i) ) point = 0;
    if (txt.match(/^.*(local|config|network|sys)/i)  ) point = 0;
    if (txt.match(/^.*(account|remote|business|sql)/i)) point = 0;
    if (txt.match(/^.*(support|comm|control|guest)/i)) point = 0;
    if (txt.match(/^.*(host|manage|operat|super)/i))   point = 0;
    if (txt.match(/^.*(test|train|window|work)/i))     point = 0;
    // mail-address
    if (txt.match(/^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i)) point = 0;
    // Check for sequential alpha string patterns (forward and reverse)
    for (var s=0; s < 24; s++) {
			var sFwd = sAlphas.substring(s,parseInt(s+3));
			var sRev = sFwd.strReverse();
			if (txt.toLowerCase().indexOf(sFwd) != -1 || txt.toLowerCase().indexOf(sRev) != -1) { nSeqChar++; }
		}
    if (nSeqChar > 0) point =0;
    nSeqChar = 0;

		/* Check for sequential numeric string patterns (forward and reverse) */
		for (var s=0; s < 9; s++) {
			var sFwd = sNumerics.substring(s,parseInt(s+3));
			var sRev = sFwd.strReverse();
			if (txt.toLowerCase().indexOf(sFwd) != -1 || txt.toLowerCase().indexOf(sRev) != -1) { nSeqChar++;}
		}
    if (nSeqChar > 0) point = 0;
    nSeqChar = 0;

    /* Check repeated char */
    if (nMaxRep > 1) point = 0;

    point = point < 0 ? 0 : point;

    this.percentage = Math.ceil(point);
    this.percentage = this.percentage > 100 ? 100 : this.percentage;
  };

  /**
   * Get the index for the appropriate label the password strength to the original.
   * @param integer
   * @param integer
   * @return string
   */
  PwdMeasure.fn.getLabelIndex = function(percentage, status){
    var _this = this,
        index = 0;

    percentage = percentage || _this.percentage;
    status = status || _this.status;

    $.each(_this.options.labels, function(i, d){
      var prev = _this.options.labels[i - 1] || {score:0, label:"", className:""};
      if( $.isNumeric(d.score) ){
        if( !$.isNumeric(prev.score) ) return true; //continue
        prev.score = parseInt(prev.score, 10);
        d.score = parseInt(d.score, 10);
        if( percentage > prev.score && percentage <= d.score ){
          index = i;
        }
      }else if(
        d.score === "empty" && status === Status.EMPTY ||
        d.score === "notMatch" && status === Status.NOT_MATCH
      ){
        index = i;
        return false;
      }
    });

    return index;
  };

  /**
   * Get the appropriate label object the password strength to the original.
   * @param integer
   * @param integer
   * @return string
   */
  PwdMeasure.fn.getLabelObj = function(percentage, status){
    var index = this.getLabelIndex(percentage, status);
    return this.options.labels[index];
  };

  /**
   * Updated state based on the value of the input field.
   * @param boolean
   * @return void
   */
  PwdMeasure.fn.update = function(isInitialize){
    var status = this.status,
        val1 = this.$elem.val(),
        val2 = this.$confirm.val(),
        confirmSize = this.$confirm.size();

    isInitialize = isInitialize === true ? true : false;

    // Upadte strength percentage
    this.calc();

    // Base + Confirm
    if( confirmSize > 0 ){
      if( val2 !== "" ){
        if( val1 === val2 ){
          status = this.percentage >= this.options.minScore ? Status.VALID : Status.INVALID;
        }else{
          status = Status.NOT_MATCH;
        }
      }else if( val1 === "" ){
        status = Status.EMPTY;
      }else{
        status = Status.INVALID;
      }

    // Base(single field)
    }else{
      if( this.percentage >= this.options.minScore ){
        status = Status.VALID;
      }else if( val1 === "" ){
        status = Status.EMPTY;
      }else{
        status = Status.INVALID;
      }
    }

    var isChangeStatus = this.status !== status;
    this.status = status;

    // Current LabelObject
    this.currentLabelObj = this.getLabelObj(null, status);

    // Render
    this._displayIndicator();

    // Callbacks
    if( !isInitialize ){
      this._callbackApply(
        this.options.onChangeValue,
        this.percentage,
        this.currentLabelObj.label,
        this.currentLabelObj.className
      );
    }

    if( isChangeStatus ){
      var options = this.options,
          percentage = this.percentage,
          currentLabelObj = this.currentLabelObj,
          type;

      switch( this.status ){
        case Status.VALID:
          type = "valid";
          this._callbackApply(
            options.onValid,
            percentage,
            currentLabelObj.label,
            currentLabelObj.className
          );
          break;

        case Status.INVALID:
          type = "invalid";
          this._callbackApply(
            options.onInvalid,
            percentage,
            currentLabelObj.label,
            currentLabelObj.className
          );
          break;

        case Status.EMPTY:
          type = "empty";
          this._callbackApply(options.onEmpty,
            percentage,
            currentLabelObj.label,
            currentLabelObj.className
          );
          break;

        case Status.NOT_MATCH:
          type = "notMatch";
          this._callbackApply(options.onNotMatch,
            percentage,
            currentLabelObj.label,
            currentLabelObj.className
          );
          break;
      }
      if( !isInitialize ){
        this._callbackApply(
          options.onChangeState,
          percentage,
          currentLabelObj.label,
          currentLabelObj.className,
          type
        );
      }
    }
  };

  /**
   * Render the current state.
   * @return void
   */
  PwdMeasure.fn._displayIndicator = function(){
    if( this.$indicator.size() === 0 ) return false;

    var html = this.options.indicatorTemplate,
        args = {
          label     : this.currentLabelObj.label,
          className : this.currentLabelObj.className,
          percentage: this.percentage
        };

    $.each(args, function(key, value){
      html = html.split("<%= " + key + " %>").join(value);
    });

    html = html.replace(/(<%= .* %>?)/g, "");

    this.$indicator
      .html(html)
      .removeClass(this._allLabelClass())
      .addClass(this.currentLabelObj.className);
  };

  /**
   * Set the various events.
   * @return void
   */
  PwdMeasure.fn._bindMethods = function(){
    var _this = this;

    // "keyup change" to "keyup.pm change.pm"
    _this.eventName = _this.options.events || "keyup";
    _this.eventName = _this.eventName.replace(/([a-z]+)( ?)/gi, "$1." + ns + "$2");

    // base element
    _this.$elem.on(_this.eventName, $.proxy(_this.update, _this));

    // confirm
    if( _this.$confirm.size() > 0 ){
      _this.$confirm.on(_this.eventName, $.proxy(_this.update, _this));
    }
  };

  /**
   * Unbind various events.
   * @return void
   */
  PwdMeasure.fn._unbindMethods = function(){
    // TODO:
  };

  /**
   * Run a callback.
   * @param function
   * @param [param1, param2, ...]
   * @return boolean
   */
  PwdMeasure.fn._callbackApply = function(){
    var callback = arguments[0],
        params = sliceArray(arguments, 1),
        f = $.isFunction(callback) ? callback : function(){};
    return f.apply(this.$elem.get(0), params);
  };

  /**
   * Get all of the label className by string.
   * @return string
   */
  PwdMeasure.fn._allLabelClass = function(){
    var className = $.map(this.options.labels, function(labelObj){
      return labelObj.className;
    });
    return className.join(" ");
  };

  /**
   * Remove the pwdMeasure.
   * @return void
   */
  PwdMeasure.fn.destroy = function(){
    this._unbindMethods();
    this.$elem.removeData(DATA_KEY);

    if( this.$indicator.size() > 0 ){
      this.$indicator
        .html(this.indicatorDefaultHtml)
        .removeClass(this._allLabelClass());
    }
  };


  // Helper
  function sliceArray(array, start, end){
    return Array.prototype.slice.call(array, start, end !== undefined ? end : array.length);
  }

  function ord(str){
    var s = str + "",
        code = s.charCodeAt(0);
    if( 0xD800 <= code && code <= 0xDBFF ){
      var hi = code;
      if( s.length === 1){
        return code;
      }
      var low = s.charCodeAt(1);
      return ( ( hi - ( 0xD800 * -1 ) ) * 0x400 ) + ( low - 0xDC00 ) + 0x10000;
    }
    if( 0xDC00 <= code && code <= 0xDFFF ){
      return code;
    }
    return code;
  }


  // Run pwdMeasure
  $.fn.pwdMeasure = function(options){
    return this.each(function(){
      if( !$(this).data(DATA_KEY) ){
        $(this).data(DATA_KEY, new PwdMeasure($(this), $.extend(true, {}, defaults, options)));
      }
    });
  };
}));
