export namespace multimedia {
	
	export class SongLibrary {
	    name: string;
	    path: string;
	
	    static createFrom(source: any = {}) {
	        return new SongLibrary(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.path = source["path"];
	    }
	}

}

