import { Color } from '../color/Color.js';

export class ModelShading {

    static setColor(model, c = Color.Blue) {
        if (model.colorList.length == 0) {
            for (var v of model.vertexList) {
                model.colorList.push(c);
            }
        }
        else {
            for (var i = 0; i < model.colorList.length; ++i) {
                model.colorList[i] = c;
            }
        }
        for (var m of model.nestedModels) {
           this.setColor(m, c);
        }
    }

    static setRandomColor(model) {
        console.log(model);
        this.setColor(model, this.randomColor());
    }

    static setRandomColors(model) {
        if (!model.colorList.length) {
            this.setRandomVertexColors(model);
        }
        else {
            for (var i = 0; i < model.colorList.length; ++i) {
                model.colorList[i] = this.randomColor();
            }
        }

        for (var m of model.nestedModels) {
            this.setRandomColors(m);
        }
    }

    /**
       Give each of this {@code Model}'s nested models
       a different random {@link Color}.
 
       @param model  {@link Model} whose color list is being manipulated
    */
    static setRandomNestedModelColors(model)
    {
        const c = this.randomColor();
        if (!model.colorList.length) {
            for (var i = 0; i < model.vertexList.length; ++i) {
                model.colorList.push(c);
            }
        }
        else {
            for (var i = 0; i < model.colorList.length; ++i) {
                model.colorList[i] = c;
            }
        }

        for (var m of model.nestedModels) {
            this.setRandomNestedModelColors(m);
        }
    }

    static setRandomVertexColors(model) {
        model.colorList = [];
        
        for (var v of model.vertexList) {
            model.colorList.push(this.randomColor());
        }

        for (var ls of model.lineSegmentList) {
            ls.cIndex[0] = ls.vIndex[0];
            ls.cIndex[1] = ls.vIndex[1];
        }

        for (var m of model.nestedModels) {
            this.setRandomVertexColors(m);
        }
    }

	static setRandomLineSegmentColors(model) {
		model.colorList = [];
		var index = 0;
		for(var ls of model.lineSegmentList) {
			model.colorList.push( this.randomColor() );
			ls.cIndex[0] = index;
			ls.cIndex[1] = index;
			++index;
		}

        for (var m of model.nestedModels) {
            this.setRandomLineSegmentColors(m);
        }
	}

	static setRainbowLineSegmentColors(model) {
		model.colorList = [];
		var index = 0;
		for(var ls of model.lineSegmentList) {
			model.colorList.push( this.randomColor() );
			model.colorList.push( this.randomColor() );
			ls.cIndex[0] = index;
			ls.cIndex[1] = index + 1;
			index += 2;
		}

        for (var m of model.nestedModels) {
            this.setRainbowLineSegmentColors(m);
        }
	}

	static randomColor() {
		let r = Math.floor(Math.random() * 255);
		let g = Math.floor(Math.random() * 255);
		let b = Math.floor(Math.random() * 255);
		return new Uint8ClampedArray([r, g, b, 255]);
	}

}
