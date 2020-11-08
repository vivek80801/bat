/**
* Principal class for scene rendering
* 
* CONFIG
* .mirielle        | styling for the mirielle canvas
* .css           | css stylings for the scene
* .attr          | html attributes of the scene
* .dynamic       | determine wether RAF should be enabled
*
*/

class GameArea {
	/**
	* @constructor
	* @param {Number} w width of the scene
	* @param {Number} h height of the scene
	* @param {Object | String} config configuration data of the scene
	*/
	constructor(w, h, config) {
        this.w = w || 300;
        this.h = h || 300;
        this.config = config;
        this.state = false;
		// game section
		this.section = document.createElement("section");
        this.section.style.margin = "0";
        this.state = false;

        // set other private screens
        this._preloadScene = new PreloadScene(this.section, this.w, 
            this.h, this.config);
        this._mirielleScene = new MirielleScene(this.section, this.w, 
            this.h, config.mirielle);
        this.section.class = "gameScene";

        // create the scene
        this.onReady = null;
        this._allScenes = [];
        this.files = [];
        this._preloadScene.start();
        document.body.appendChild(this.section);
	}

    getArea() {
        return this.section;
    }

    
    /**
    * @method getMedia
    * @description get any media files from the preloaded array
    * @returns {HTMLImageElement | HTMLAudioElement}
    */
    getMedia(name, type="img") {
        let preload = this._preloadScene;
        if(type === "img" || type === "image") {
            let res = preload._preloadedImages.filter(i => i.name === name)[0];
            return res.img;
        }else if(type === "aud" || type === "audio") {
            let res = preload._preloadedAudios.filter(i => i.name === name)[0];
            return res.aud;
        } else if(type === "other" || type === "json") {
            let res = this._preloadScene._preloadedFiles.filter(i => i.name === name)[0];
            return res.res;
        }
    }

    animate() {
        const animate = currentTime => {
            if(typeof this.clear === "function" && typeof this.update === "function") {
                this.clear();
                this.update();
                requestAnimationFrame(animate);
            }
        }
        return animate;
    }

    init() {
        const appendChildScene = () => {
            this._allScenes.forEach(scene => {
                if(scene instanceof Scene) {
                    this.section.appendChild(scene.getCanvas());
                    scene._fpsStarted = performance.now();
                    scene._elapsedTimeStarted = new Date().getTime();
                    if(scene.dynamic) {
                        requestAnimationFrame(scene.animate());
                    } else {
                        if(typeof this.update === "function")
                            scene.update();
                        else console.error(`Scene does not have a valid update method`);
                    }
                } else this.section.appendChild(scene);
            });
        }

        let mainInterval = setInterval(() => {
            if(this._mirielleScene.state) {
                // has every assets been loaded ?
                if(this.config.preload.length !== 0) {
                    Promise.all(this._preloadScene.promisesArr)
                    .then(value => {
                        clearInterval(mainInterval);
                        this.state = true;
                        this.files.push(this._preloadScene._preloadedFiles);
                        if(typeof this.onReady === "function") this.onReady();
                        appendChildScene();
                    }).catch(value => {
                        this._preloadScene.activeScene();
                        // this.state = false;
                    });
                } else {
                    clearInterval(mainInterval);
                    this.state = true;
                    appendChildScene();
                }
            }
        }, 0);
    }

    appendChild(...element) {
        element.forEach(ele => {
            if(ele instanceof HTMLElement)
                this._allScenes.push(ele);
        }); 
    }

    getWidth() {
        return this.w;
    }

    getHeight() {
        return this.h;
    }
		
};