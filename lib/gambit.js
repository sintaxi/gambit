/*
 
  File:transitions.js
 
 Abstract: Creates transition functionality for the Simple 
		   Browser sample. Allows to create a set of transitions
		   that can be grouped and performed together.
  
 Version: 1.0
 
 Disclaimer: IMPORTANT:  This Apple software is supplied to you by 
 Apple Inc. ("Apple") in consideration of your agreement to the
 following terms, and your use, installation, modification or
 redistribution of this Apple software constitutes acceptance of these
 terms.  If you do not agree with these terms, please do not use,
 install, modify or redistribute this Apple software.
 
 In consideration of your agreement to abide by the following terms, and
 subject to these terms, Apple grants you a personal, non-exclusive
 license, under Apple's copyrights in this original Apple software (the
 "Apple Software"), to use, reproduce, modify and redistribute the Apple
 Software, with or without modifications, in source and/or binary forms;
 provided that if you redistribute the Apple Software in its entirety and
 without modifications, you must retain this notice and the following
 text and disclaimers in all such redistributions of the Apple Software. 
 Neither the name, trademarks, service marks or logos of Apple Inc. 
 may be used to endorse or promote products derived from the Apple
 Software without specific prior written permission from Apple.  Except
 as expressly stated in this notice, no other rights or licenses, express
 or implied, are granted by Apple herein, including but not limited to
 any patent rights that may be infringed by your derivative works or by
 other works in which the Apple Software may be incorporated.
 
 The Apple Software is provided by Apple on an "AS IS" basis.  APPLE
 MAKES NO WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION
 THE IMPLIED WARRANTIES OF NON-INFRINGEMENT, MERCHANTABILITY AND FITNESS
 FOR A PARTICULAR PURPOSE, REGARDING THE APPLE SOFTWARE OR ITS USE AND
 OPERATION ALONE OR IN COMBINATION WITH YOUR PRODUCTS.
 
 IN NO EVENT SHALL APPLE BE LIABLE FOR ANY SPECIAL, INDIRECT, INCIDENTAL
 OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 INTERRUPTION) ARISING IN ANY WAY OUT OF THE USE, REPRODUCTION,
 MODIFICATION AND/OR DISTRIBUTION OF THE APPLE SOFTWARE, HOWEVER CAUSED
 AND WHETHER UNDER THEORY OF CONTRACT, TORT (INCLUDING NEGLIGENCE),
 STRICT LIABILITY OR OTHERWISE, EVEN IF APPLE HAS BEEN ADVISED OF THE
 POSSIBILITY OF SUCH DAMAGE.
 
 Copyright (C) 2008 Apple Inc. All Rights Reserved.
 
 */

function Transition () {
  // callback for the first batch of operation, where we set the default properties
  // for the transition (transition-property and transition-duration) as well as 
  // the "from" property value if explicitely passed as a param to .add()
  this.instantOperations = new Function (); 
  // callback for the second batch of operation, where we set the "to" property value
  this.deferredOperations = new Function (); 
};

// Core defaults for the transitions, you can update these members so that all
// calls to .add() from that point on use this duration and set of properties
Transition.DEFAULTS = {
  duration : .25,    // default to 1 second
  properties : []
};


/*
 Adds a CSS transition, parameters are :
 
 element:     target element for transition
 duration:    duration for all transitions in seconds
 properties:  the properties that are transitioned (will be fed to '-webkit-transition-property')
 from:        optional list of initial property values to match properties passed as .properties
 to:          list of final property values to match properties passed as .properties
 
 The .duration and .properties parameters are optional and can be defined once for
 all upcoming transitions by over-riding the Transition.DEFAULTS properties

 Some operations need to be deferred so that the styles are currently set for the from state
 of from / to operations 

 */

Transition.prototype.add = function (params) {
  var style = params.element.style;
  // set up properties
  var properties = (params.properties) ? params.properties : Transition.DEFAULTS.properties;
  // set up durations
  var duration = ((params.duration) ? params.duration : Transition.DEFAULTS.duration) + 's';
  var durations = [];
  for (var i = 0; i < properties.length; i++) {
    durations.push(duration);
  }
  // from/to animation
  if (params.from) {
    this.addInstantOperation(function () {
      style.webkitTransitionProperty = 'none';
      for (var i = 0; i < properties.length; i++) {
        style.setProperty(properties[i], params.from[i], '');
      }
    });
    this.addDeferredOperation(function () {
      style.webkitTransitionProperty = properties.join(', ');
      style.webkitTransitionDuration = durations.join(', ');
      for (var i = 0; i < properties.length; i++) {
        style.setProperty(properties[i], params.to[i], '');
      }
    });
  }
  // to-only animation
  else {
    this.addDeferredOperation(function () {
      style.webkitTransitionProperty = properties.join(', ');
      style.webkitTransitionDuration = durations.join(', ');
      for (var i = 0; i < properties.length; i++) {
        style.setProperty(properties[i], params.to[i], '');
      }
    });
  }
};

// adds a new operation to the set of instant operations
Transition.prototype.addInstantOperation = function (new_operation) {
  var previousInstantOperations = this.instantOperations;
  this.instantOperations = function () {
    previousInstantOperations();
    new_operation();
  };
};

// adds a new operation to the set of deferred operations
Transition.prototype.addDeferredOperation = function (new_operation) {
  var previousDeferredOperations = this.deferredOperations;
  this.deferredOperations = function () {
    previousDeferredOperations();
    new_operation();
  };
};

// called in order to launch the current group of transitions
Transition.prototype.apply = function () {
  this.instantOperations();
  var _this = this;
  setTimeout(_this.deferredOperations, 0);
};

/* -------------------------------------------------- */

Gambit = {
	
	init: function(){
	  // 
	  var body = document.getElementsByTagName("body")[0]
	  body.style.minHeight = window.innerHeight + "px"
	  
    // interate over cards
	  var cards = document.getElementsByClassName("card")
	  for (var i = 0; i < cards.length; ++i) {
	    cards[i].style.display = i === 0 ? "block" : "none"
    }
    
    // TODO: change this to use event delegation
    // TODO: change this to take advantage of touchstart
    //
    // interate over links to find reference to cards
    var links = document.getElementsByTagName("a")
    for (var i = 0; i < links.length; ++i) {
      var isRef = new RegExp(/^#/).exec(links[i].getAttribute("href"))
      if(isRef){
        links[i].onclick = function(e){
          e.preventDefault()
          Gambit.get(e);
          return false
        }
      }
    }

	},
	
	get: function(event){
		event.preventDefault();
    
    // set blurCard
    var blurCard = document.getElementsByClassName("current")[0];
    
    // set focusCard
    var focusCardId = event.target.href.substring(event.target.href.indexOf('#')).split("#")[1]
		var focusCard   = document.getElementById(focusCardId)
		
		// add current to focus card
		focusCard.className = focusCard.className + " current"
		
		// remove current from blur card
		var reg = new RegExp('(\\s|^)current(\\s|$)');
		blurCard.className= blurCard.className.replace(reg,' ');
		
		// find direction
		if(event.target.className.indexOf("back") !== -1){
		  var direction = "back"
		}else{
  		var direction = "forward";		  
		}
		
		// find transition
		var transitionCard = (direction == "back") ? blurCard : focusCard
		var match = new RegExp(/anim-([a-z]+)/).exec(transitionCard.className);
		var type = (match == null) ? Transisions.defaults.type : match[1];
		
		//console.log(direction)
		
		// animate!
		Transisions[(Transisions[type] == null ? Transisions.defaults.type : type)](direction, focusCard, blurCard);
		
    return false;
	}
	
}

Transisions = {
  
  defaults: { type: "swipe" },
  
  swipe: function(direction, focusCard, blurCard){
    var transition = new Transition();    
    Transition.DEFAULTS.properties = ['-webkit-transform', 'display'];
    Transition.DEFAULTS.duration = .25;
    
    transition.add({
      element : blurCard,
      from : ['translateX(0px)', "block"],
      to : ['translateX(' + (window.innerWidth * (direction == "back" ? 1 : -1)) + 'px)', "block"]
    });
  
    transition.add({
      element : focusCard,
      from : ['translateX(' + (window.innerWidth * (direction == "back" ? -1 : 1)) + 'px)', 'block'],
      to : ['translateX(0px)', "block"]
    });
    
    transition.apply();
  },
  
  reveal: function(direction, focusCard, blurCard){
    var transition = new Transition();    
    Transition.DEFAULTS.properties = ['-webkit-transform', 'display'];
    Transition.DEFAULTS.duration = .25;
    
    transition.add({
      element : blurCard,
      from : ['translateX(0px)', "block"],
      to : ['translateX(' + (window.innerWidth * (direction == "back" ? -1 : 1) -50) + 'px)', "block"]
    });
  
    transition.add({
      element : focusCard,
      from : ['translateX(0px)', 'block'],
      to : ['translateX(0px)', "block"]
    });
    
    transition.apply();
  },
  

  flip: function(direction, focusCard, blurCard){
    var transition = new Transition();    
    Transition.DEFAULTS.properties = ['-webkit-transform', 'display'];
    Transition.DEFAULTS.duration = .25;

    transition.add({
      element : focusCard,
      from : ['rotateY(180deg) scale(0.8)',"block"],
      to : ['rotateY('+(direction == "back" ? "360" : "0")+'deg) scale(1)', "block"]
    });

    transition.add({
      element : blurCard,
      from : ['rotateY(0deg) scale(1)', "block"],
      to : ['rotateY('+(direction == "back" ? "180" : "-180")+'deg) scale(0.8)', "block"]
    });
  
    transition.apply();
  },
  
  toaster: function(direction, focusCard, blurCard){
    var transition = new Transition();    
    
    Transitions.DEFAULTS.properties = ['-webkit-transform', 'display'];
    Transitions.DEFAULTS.duration = .25;

    if (direction == "back"){
      focusCard.style.display = "block"
      transition.add({
        element : blurCard,
        from : ['translateY(0px)', "block"],
        to : ['translateY(' + window.innerHeight + 'px)', "block"]
      });
    }else{
      transition.add({
        element : focusCard,
        from : ['translateY(' + window.innerHeight + 'px)', 'block'],
        to : ['translateY(0px)', "block"]
      });
    }
    
    transition.apply();
  }

}
