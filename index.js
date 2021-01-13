var model = undefined;
const classifierElement = document.getElementById('classifier');
const loader = document.getElementById("loader");
const result = document.getElementById("result");
const listImgs = document.getElementById("list-imgs");
const mainImage = document.getElementById("main-img");
const imageDisplay = mainImage.firstElementChild;
const inputURL = document.getElementById("img-url");
const proxyUrl = "https://cors-anywhere.herokuapp.com/"; // fix CORP problem
const predictLoader = document.getElementById("predict-loader");

// init
async function initialize() {
    // model = await tf.loadGraphModel('saved_model/not-quantized/model.json');
    model = await tf.loadGraphModel('saved_model/quantized/model.json');
		classifierElement.style.display = 'block';
		listImgs.style.display = "flex";
		if (bar<99){
			bar = 100;
			clearInterval(idloader);
			loader.style.display = "none";
		}
    document.getElementById('predict').addEventListener('click', () => {
			// predictLoader.style.display = "block";
			predict();
			// predictLoader.style.display = "none";
		});
}

// when predict button is clicked
async function predict () {
	try {
		// imageDisplay = mainImage.firstElementChild;
		if (imageDisplay.src != ""){

			mainImage.style.display = "block";

			const offset = tf.scalar(255.0);
			let tensorImg = tf.browser
												.fromPixels(imageDisplay)
												.resizeNearestNeighbor([200, 200])
												.toFloat().sub(offset)
												.div(offset)
												.expandDims();
			prediction = await model.predict(tensorImg).data();

			result.style.display = "block";

			var score = Math.round((prediction[0] + Number.EPSILON) * 100);

			if (prediction[0] > 0.65) {
				result.getElementsByTagName("p")[0].innerHTML
					= "It's <b>a mountain</b> (or related)!"
					+ " I'm <b>" + String(score) + "%</b> sure!";
			} else if(prediction[0] < 0.35) {
				result.getElementsByTagName("p")[0].innerHTML
					= "It's <b>a beach</b> (or related)!"
						+ " I'm <b>" + String(100-score) + "%</b> sure!";
			} else{
				var notSure = ((prediction[0]>0.5) ? "mountain" : "beach");
				var notSureScore = ((prediction[0]>0.5) ? score : 100-score);
				result.getElementsByTagName("p")[0].innerHTML
					= "I'm not so confident what it is!"
						+ " There may be some errors with your image or the image you indicated is not clearly a mountain or a beach."
						+ " Please choose another one."
						+ " If you ask me to guess anyway, it's a <b>" + notSure
						+ "</b> with <b>" + String(notSureScore) + "%</b> confidence!";
			}

			imageDisplay.setAttribute("crossorigin", "");
		} else {
			result.getElementsByTagName("p")[0].innerHTML
				= "You have to indicate an image to predict!"
		}

	} catch (err) {
		result.getElementsByTagName("p")[0].innerHTML
			= "There are some unexpected errors. Please choose another image!"
	}
}

// loading bar
let seconds = 50;
let bar = 1;
let idloader = setInterval(function(){
    bar++;
		var percent = loader.lastElementChild.firstElementChild;
		percent.setAttribute("aria-valuenow", String(bar));
		percent.style = "width: " + String(bar) + "%;";
}, seconds * 1000 / 100)

// button upload
function changeImage() {
    var uploadedImage = document.getElementById('my-file-selector').files[0];
		imageDisplay.src = URL.createObjectURL(uploadedImage);
		result.style.display = "none";
		mainImage.style.display = "block";
}

// if users uses url?
async function changeImageByUrl() {
	// mainImage.style.display = "none";
	result.style.display = "none";
	var imgUrl = inputURL.value;
	// if (imgUrl.includes("base64")){
	// 	var blob = dataURItoBlob(dataURI);
	// 	imageDisplay.src = URL.createObjectURL(blob);
	// } else if (imgUrl.match(/\.(jpeg|jpg|gif|png)$/) != null) {
	// 	await fetch(proxyUrl+imgUrl) // https://cors-anywhere.herokuapp.com/${url}
	// 		.then(response => response.blob())
	// 		.then(images => {
	// 			imageDisplay.src = URL.createObjectURL(images);
	// 		})
	// }

	if (imgUrl.match(/\.(jpeg|jpg|gif|png)$/) != null){
		imageDisplay.src = imgUrl;
		imageDisplay.setAttribute("crossorigin", "anonymous");
	}
}

// convert base64 to normal url of an image
// src: https://stackoverflow.com/questions/51416374/how-to-convert-base64-to-normal-image-url
function dataURItoBlob(dataURI)
{
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if(dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
    else
        byteString = unescape(dataURI.split(',')[1]);
    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for(var i = 0; i < byteString.length; i++)
    {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ia], {type: mimeString});
}

// list of example images
listImgs.getElementsByClassName("item").forEach(it => {
	it.addEventListener("click", function(){
		imageDisplay.src = it.firstElementChild.src;
		result.style.display = "none";
		mainImage.style.display = "block";
	});
});

initialize();