/*
Global vars
*/
var instance;
var timing;
var eventlogcount=0;
var currentsong=1;
var totalsongs=0;
var repeat=false;
var random=false;


/*
Functions
*/

// adds a event to the log
function logEvent(e){
	var actualtime=new Date(e.timeStamp);
	var timetolog=actualtime.getHours()+":"+actualtime.getMinutes()+":"+actualtime.getSeconds();
	var eventaction=e.type;
	var eventelement=e.innerText;
	addToEventLog(eventaction,eventelement,timetolog);
	console.log(e);
}

// adds an item to the log
function addToEventLog(actionev,eventelement,eventtime){
	document.getElementById("eventlogcount").innerHTML = ++eventlogcount;
 	var rowstr="";
	if (eventlogcount%2==0)
		rowstr+="<tr class=\"even\">";
	else
		rowstr+="<tr class=\"odd\">";
	rowstr+="<td>"+ actionev +"</td>";
	rowstr+="<td>"+ eventelement +"</td>";
	rowstr+="<td>"+ eventtime +"</td>";
	rowstr+="</tr>"
	document.getElementById("eventlog").innerHTML += rowstr;
};

// a song ends
function songEnds() {
	if (random)
		playSongHandler(Math.floor((Math.random() * totalsongs) + 1));
	else
		if (repeat){
			(currentsong+1 < totalsongs) ? playSongHandler(++currentsong) : currentsong=1; playSongHandler(currentsong);
		}else{
			stopSong();
		}
};

// plays a song
function playSongHandler(songid) {
	currentsong=songid;
	if (!(instance && instance.resume())){ //resume pause
		if (instance) //stops current song
			stopSong(); 
		instance = createjs.Sound.play(songid); //plays selected
	}
    instance.addEventListener("complete", songEnds);
    //change btn from play to pause
    playbtn.style.display = "none";
    pausebtn.style.display="";
    timing = setInterval(update,3);//most fluid than 1000
};

// pause the current song
function pauseSong() {
	instance.pause();
	clearInterval(timing);
	pausebtn.style.display="none";
	playbtn.style.display="";
};

// stop the song (another song selected)
function stopSong() {
	pauseSong();
	instance.setPosition(0);
};

// moves the player to a position given by an event
function moveToPosition(e){//gets the position from event
	if (instance){
		var posx = e.clientX;
		console.log("posx "+posx);

		var pbwidth = document.getElementById("playing").clientWidth;
	    
	    console.log("getdur "+instance.getDuration());
	    console.log("posicion "+(posx/pbwidth) * instance.getDuration() );
	    instance.setPosition( (posx/pbwidth) * instance.getDuration() );		
	}
};

// update all items (transcurred time, progressbar, circle)
function update(){
	var playedms = instance.getPosition();

	document.getElementById("transcurredtime").innerHTML=parseInt(msToMinutes(playedms))+":"+parseInt(msToSecondsWithoutMinutes(playedms));

	var percentplayed=percent(playedms,instance.getDuration());
	//document.getElementById("progressbar").innerHTML=percentplayed;

	document.getElementById("progressbar").style.width=percentplayed+"%";

};

// register a song
function registerSong(songid) {
	createjs.Sound.registerSound("assets/resources/songs/"+songid+".ogg",songid);
};

// mute the sound
function muteSound(){
	instance.setMute(!instance.getMute());
}

// filters the data "songs", "artists", "albums"
function filter(tofilterid){
	var path="assets/json/"+tofilterid+".json";
	var content=loadJSON(path,
         function(data) { console.log(data); },
         function(xhr) { console.error(xhr); },
         tofilterid);
};

// loads a json
// method taken from http://stackoverflow.com/questions/9838812/how-can-i-open-a-json-file-in-javascript-without-jquery
function loadJSON(path, success, error, filterid)
{
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function()
    {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                if (success)
                    displaySounds(JSON.parse(xhr.responseText),filterid);
            } else {
                if (error)
                    error(xhr);
            }
        }
    };
    xhr.open("GET", path, true);
    xhr.send();

}

//converts a json to tables of the reproductor
function displaySounds(content, filterid){/*in json*/
	//maybe a template here? remove the spaggetti code and sanitize
	//creating the header of the table
	var rowstr="<tr class=\"theader\">";
	switch(filterid) {
  		case "artists":
       		rowstr+="<th>Artista</th>";
       	break;
    	case "albums":
       		rowstr+="<th>Artista</th><th>Album</th>";
       	break;
    	default:
    		rowstr+="<th>Pista</th><th>Artista</th><th>Tiempo</th><th>Album</th>";
	}
	rowstr+="</tr>";
	for (var i=0; i<content.structure.length; i++){
		registerSong(content.structure[i].id);
		//creating the content of the table
		if (i%2==0)
			rowstr+="<tr class=\"even\"";
		else
			rowstr+="<tr class=\"odd\"";
		rowstr+=" onclick=\"playSongHandler(" +content.structure[i].id+")\">";
		rowstr+= (filterid=="songs") ? "<td>"+ content.structure[i].songs+"</td>" : "";
		rowstr+="<td>"+ content.structure[i].artists+"</td>";
		rowstr+= (filterid=="songs") ? "<td>"+ content.structure[i].time +"</td>" : "";
		rowstr+= (filterid!="artists") ? "<td>"+ content.structure[i].albums+"</td>" : "";
		rowstr+="</tr>"
	}
	totalsongs=content.structure.length;
	document.getElementById("content").innerHTML = rowstr;
};

//hide or show a element
function showHideElement(element){
	if (document.getElementById(element).style.display == "none")
		document.getElementById(element).style.display = "";
	else 
		document.getElementById(element).style.display = "none";
}


/*
maths
*/
//miliseconds to seconds
function msToSeconds(mscs){
	return mscs/1000;
}
//miliseconds to minutes
function msToMinutes(mscs){
	return msToSeconds(mscs)/60;
}
//miliseconds to seconds without minutes (ie: 127 ret 7)
function msToSecondsWithoutMinutes(mscs){
	return msToSeconds(mscs)%60;
}
//percent of a part in a total
function percent(part,total){
	return part*100.0/total;
}
// negate the random bool state
function setRandom(){
	random=!random;
}
// negates repeat (have to reuse the method setrandom..)
function setRepeat(){
	repeat=!repeat;
}


var playbtn, pausebtn, backbtn, nextbtn, lbtn, rbtn, playing, eventbtn, volumebtn, filtersongs, filteralbums, filterartists;

// when site is loaded, loads the listeners and +
window.onload=function(){
	// show songs as default
	filter("songs");
	// event is triggered (for logs)
	document.onclick = function (e) { return logEvent(e); };
	document.ondblclick = function (e) { return logEvent(e); }; 
	document.onkeyup = function (e) { return logEvent(e); }; 
	/*
	Other vars and Listeners
	*/
	playbtn = document.getElementById("btn-play");
	pausebtn = document.getElementById("btn-pause");
	backbtn = document.getElementById("btn-back");
	nextbtn = document.getElementById("btn-next");
	lbtn = document.getElementById("btn-l");
	rbtn = document.getElementById("btn-r");
	playing = document.getElementById("playing");
	eventbtn = document.getElementById("btn-events");
	volumebtn = document.getElementById("btn-volume");
	filtersongs = document.getElementById("filter-songs");
	filteralbums = document.getElementById("filter-albums");
	filterartists = document.getElementById("filter-artists");

	playbtn.addEventListener("click", function(){playSongHandler(currentsong)} );
	pausebtn.addEventListener("click", pauseSong );
	backbtn.addEventListener("click", function(){ currentsong-1 > 0 ? playSongHandler(--currentsong) : currentsong=totalsongs; playSongHandler(currentsong); } );
	nextbtn.addEventListener("click", function(){currentsong+1 < totalsongs ? playSongHandler(++currentsong) : currentsong=1; playSongHandler(currentsong);} );
	playing.addEventListener("click", moveToPosition);
	lbtn.addEventListener("click", setRepeat );
	rbtn.addEventListener("click", setRandom );
	eventbtn.addEventListener("click",  function(){ showHideElement("eventlog")} );
	volumebtn.addEventListener("click", muteSound );
	volumebtn.addEventListener("mouseover", function(){ showHideElement("volume")} );
	volumebtn.addEventListener("mouseout", function(){ showHideElement("volume")} );
	filtersongs.addEventListener("click", function(){filter("songs")} );
	filteralbums.addEventListener("click", function(){filter("albums")} );
	filterartists.addEventListener("click", function(){filter("artists")} );
}