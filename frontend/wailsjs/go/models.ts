export namespace multimedia {
	
	export class Lib {
	    name: string;
	    path: string;
	
	    static createFrom(source: any = {}) {
	        return new Lib(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.path = source["path"];
	    }
	}
	export class LibItem {
	    name: string;
	    path: string;
	    isFolder: boolean;
	
	    static createFrom(source: any = {}) {
	        return new LibItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.path = source["path"];
	        this.isFolder = source["isFolder"];
	    }
	}

}

