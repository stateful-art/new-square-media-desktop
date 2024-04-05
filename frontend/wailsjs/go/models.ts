export namespace multimedia {
	
	export class SongLibrary {
	    name: string;
	    path: string;
	    isFolder: boolean;
	
	    static createFrom(source: any = {}) {
	        return new SongLibrary(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.path = source["path"];
	        this.isFolder = source["isFolder"];
	    }
	}

}

