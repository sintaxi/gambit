var Transition = function(callback){
  this.instantOperations  = []
  this.deferredOperations = []
  this.total = 0
  this.count = 0
  this.callback = callback || new Function()
  return this;
}

Transition.prototype.add = function(el, args, cb){
  var properties  = []
  var durations   = []
  var that        = this

  if(!cb) cb = new Function()

  // properties & durations
  for (var arg in args) (function(arg){
    properties.push(arg)
    durations.push(args[arg]["duration"] || "0.25s")
  
    // add to instant queue
    if(args[arg].hasOwnProperty(["from"])){
      that.instantOperations.push(function(){
        el.style.webkitTransitionDuration = "0s";
        el.style.setProperty(arg, args[arg]["from"], null)
      })
    }        
  })(arg)

  // add to deffered queue
  this.deferredOperations.push(function(){
    that.total ++
    
    // property & duration
    el.style.webkitTransitionProperty = properties.join(", ")
    el.style.webkitTransitionDuration = durations.join(", ")
    
    // listeners
    function done(event){
      count ++;
      // console.log('done property', count)
      if(count >= properties.length){
        el.removeEventListener('webkitTransitionEnd', done, false)
        that.count ++
        // console.log('done element', that.count)
        cb(el)
        if(that.count >= that.total){
          el.removeEventListener('webkitTransitionEnd', done, false)
          // console.log('done transition', that.count, that.total)
          that.callback()
        }
      }
    }
    
    var count = 0;
    el.addEventListener('webkitTransitionEnd', done)
    
    for (var arg in args)(function(k, v){
      el.style.setProperty(k, v, null)
    })(arg, args[arg]["to"])
  })

}

Transition.prototype.run = function(callback){
  var that = this
  that.count = 0
  that.total = 0
  if(callback) that.callback = callback
  that.instantOperations.forEach(function(fn){ fn.call(that); })
  setTimeout(function(){ that.deferredOperations.forEach(function(fn){ fn.call(that); }) }, 0)
}

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
    // var links = document.getElementsByTagName("a")
    // for (var i = 0; i < links.length; ++i) {
    //   var isRef = new RegExp(/^#/).exec(links[i].getAttribute("href"))
    //   if(isRef){
    //     links[i].onclick = function(e){
    //       e.preventDefault()
    //       Gambit.get(e);
    //       return false
    //     }
    //   }
    // }

	},
	
	get: function(focusCardId, type, direction){
	  if(!direction) direction = "forward"
	  if(!type) type = "reveal"
		
	  // focusCard
	  var focusCard = document.getElementById(focusCardId)
    
    // blurCard
    var blurCard = document.getElementsByClassName("current")[0];
    
    if(focusCard === blurCard){
      console.log("no card change")
    }else{
      // add current to focus card
      focusCard.className = focusCard.className + " current"

      // remove current from blur card
      var reg = new RegExp('(\\s|^)current(\\s|$)');
      blurCard.className= blurCard.className.replace(reg,' ');

  		// animate!
  		Transisions[(Transisions[type] == null ? Transisions.defaults.type : type)](direction, focusCard, blurCard);
    }

	}
	
}

var hide = function(el){
  el.style.display = "none"
}

Transisions = {
  
  reveal: function(direction, focusCard, blurCard){
    
    var transition = new Transition()
    
    transition.add(blurCard, {
      "-webkit-transform": {
        "from": 'translateX(0px)',
        "to": 'translateX(' + (window.innerWidth * (direction == "back" ? 1 : -1)) + 'px)',
        "duration": "0.35s"
      }
    }, hide)
    
    transition.add(focusCard, {
      "-webkit-transform": {
        "from": 'translateX(' + (window.innerWidth * (direction == "back" ? -1 : 1)) + 'px)',
        "to": 'translateX(0px)',
        "duration": "0.35s"
      }
    })
    
    focusCard.style.display = "block"
    focusCard.style.zIndex = "10"
    blurCard.style.zIndex = "11"
    
    transition.run()
  },
  
  toaster: function(direction, focusCard, blurCard){
    
    var transition = new Transition()
    
    if(direction == "back"){
      transition.add(blurCard, {
        "-webkit-transform": {
          "from": 'translateY(0px)',
          "to": 'translateY(' + window.innerHeight + 'px)',
          "duration": "0.35s"
        }
      }, hide)
      blurCard.style.zIndex = "11"
      focusCard.style.zIndex = "10"
    }else{
      transition.add(focusCard, {
        "-webkit-transform": {
          "from": 'translateY(' + window.innerHeight + 'px)',
          "to": 'translateY(0px)',
          "duration": "0.35s"
        }
      })
      blurCard.style.zIndex = "10"
      focusCard.style.zIndex = "11"
    }
    
    focusCard.style.display = "block"
    transition.run()
    
  }

}
