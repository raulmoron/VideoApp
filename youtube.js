/**
 * Video Application.
 *
 * 2014 Raúl Morón
 *
 */

/**
 * Simple object to manage the AJAX calls.
 */
var AJAX = {
	request: function(url){
		var xhr = new XMLHttpRequest();
		xhr.open("GET", url, false);
		xhr.send();

		return xhr.responseText;
	}
}

/*
 * Manage the layout content.
 */
var Layout = {
	createContainer: function(id, element){
    	var container = document.createElement(element);
		container.id = id;

		return container;
    },
    createImage: function(src, alt){
    	var img = document.createElement("img");
	    img.src = src;
	    img.alt = alt;
	    return img;
    },
    renderContainer: function(container){
    	document.body.appendChild(container);
    },
}

/**
 * Manage Videos.
 */
var Videos = {
	api: {},
	container_id: "videos",
	autoplay: true,
    getVideos: function(){
    	var json_response = JSON.parse(this.api.request());
    	return this.api.getVideos(json_response);
    },

    createVideoImage: function(src, title){
    	var figure = document.createElement("figure");

    	var img = Layout.createImage(src, title);

	    figure.appendChild(img);

	    return figure;
    },

    createTitle: function(title){
    	var title_tag = document.createElement("h2");
    	title_tag.innerHTML = title; // innerHTML example of use.
	    return title_tag;
    },

    createPlayLink: function(video_id, video_url){
    	var link 		= document.createElement("a");
	    link.className 	= "play-video";
	    link.href 		= video_url;
	    link.setAttribute("data-video-id", video_id); // Set dataset to known the video id.
		link.appendChild( Layout.createImage("https://www.youtube.com/yt/brand/media/image/YouTube-icon-full_color.png", "Play") );

		// Apply listener to the play button.
		Listener.add(
			link,
			"click",
	    	Listener.eventPlay,
		    false
		);

		return link;
    },

    appendVideoImage: function(video, container, index) {
    	var src 		= this.api.getImagePath(video);
		var video_url 	= this.api.getVideoPath(video,this.autoplay);
		var video_title = this.api.getVideoTitle(video);
		var video_id 	= "video" + index;

		var list_item = Layout.createContainer(video_id, "li");
		list_item.appendChild(this.createVideoImage(src, video_title));
		list_item.appendChild(this.createTitle(video_title));
		list_item.appendChild(this.createPlayLink(video_id, video_url));

		return list_item;
	},

	renderVideosList: function(videos,container){
		

		for (var i = 0; i < videos.length; i++) {
			list_item = this.appendVideoImage(videos[i], container, i);
			container.appendChild(list_item);
		};

		Layout.renderContainer(container);
	},

	replaceImageByVideo: function(id_video, video_url){
		var container = document.getElementById(id_video);
		container.innerHTML = '<embed src="'+ video_url +'">';
	},

	resetApplication: function(){
		var container = document.getElementById(this.container_id);
		
		if(container){
			container.parentNode.removeChild(container);
		}
	},

    start: function(api){
    	this.resetApplication()
    	this.api = api;

    	var container = Layout.createContainer(this.container_id, "ul");
		this.renderVideosList( this.getVideos(), container );
    }
}

/**
 * Object Listener to add and manage events.
 */
var Listener = {
	add: function(object, event, callback, capture){
		object.addEventListener(event,callback,capture);
	},
	eventPlay: function(event){
		event.preventDefault();

		var id_video = event.target.parentNode.dataset.videoId;
		var video_url = event.target.parentNode.href;
		Videos.replaceImageByVideo(id_video, video_url);
	},
	eventSearch: function(event){
		event.preventDefault();
		
		var query = event.target.parentNode.childNodes[0].value;
		if(!query){
			alert("Your search is short.");
			return false
		}

		var api_url = "http://gdata.youtube.com/feeds/api/videos?q="+ query +"&caption&v=2&alt=json";
		Videos.start(new Youtube(api_url));
	}
}

/**
 * Search form.
 */
var Search = {
	renderForm: function(){
		var form = Layout.createContainer("search", "form");
		var input = document.createElement("input");
		input.id = "query";
		input.name = "query";
		input.type = "search";

		var button = document.createElement("button");
		button.innerHTML = "Search";
		
		form.appendChild(input);
		form.appendChild(button);

		// Apply listener to the search button.
		Listener.add(
			button,
			"click",
			Listener.eventSearch,
			false
		);

		Layout.renderContainer(form);
	}
}

/**
 * Youtube api object.
 */
function Youtube(api_url){
	this.api_url = api_url;

	this.request = function(){
		return AJAX.request(this.api_url);
    }

	this.getVideos = function(video_object)
	{
		return video_object.feed.entry;
	}

	this.getImagePath = function(video)
	{
		return video.media$group.media$thumbnail[1].url;
	}

	this.getVideoPath = function(video, autoplay)
	{
		return video.content.src + "&autoplay=" + autoplay;
	}

	this.getVideoTitle = function(video)
	{
		return video.title.$t;
	}
}

var Application = {
	start: function(){
		Search.renderForm();

		var api_url = "http://gdata.youtube.com/feeds/api/standardfeeds/most_popular?v=2&alt=json";
		Videos.start(new Youtube(api_url));
	}
}

Listener.add(
	document,
	"DOMContentLoaded",
	Application.start(),
	capture = false
);


