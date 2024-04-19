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

export namespace place {
	
	export class Link {
	    platform: string;
	    url: string;
	
	    static createFrom(source: any = {}) {
	        return new Link(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.platform = source["platform"];
	        this.url = source["url"];
	    }
	}
	export class Location {
	    type: string;
	    coordinates: number[];
	
	    static createFrom(source: any = {}) {
	        return new Location(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.type = source["type"];
	        this.coordinates = source["coordinates"];
	    }
	}
	export class PlaceDTO {
	    id?: string;
	    owner?: string;
	    email: string;
	    phone: string;
	    spotify_id: string;
	    name: string;
	    location: Location;
	    city: string;
	    country: string;
	    description: string;
	    image: string;
	    links: Link[];
	
	    static createFrom(source: any = {}) {
	        return new PlaceDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.owner = source["owner"];
	        this.email = source["email"];
	        this.phone = source["phone"];
	        this.spotify_id = source["spotify_id"];
	        this.name = source["name"];
	        this.location = this.convertValues(source["location"], Location);
	        this.city = source["city"];
	        this.country = source["country"];
	        this.description = source["description"];
	        this.image = source["image"];
	        this.links = this.convertValues(source["links"], Link);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace playlist {
	
	export class Song {
	    _id?: string;
	    name?: string;
	    artist?: string;
	    play_count?: number;
	
	    static createFrom(source: any = {}) {
	        return new Song(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this._id = source["_id"];
	        this.name = source["name"];
	        this.artist = source["artist"];
	        this.play_count = source["play_count"];
	    }
	}
	export class PlaylistDTO {
	    _id?: string;
	    name?: string;
	    description?: string;
	    owner?: string;
	    type?: string;
	    content_source?: string;
	    revenue_sharing_model?: string;
	    revenue_cut_percentage?: number;
	    songs?: Song[];
	    url?: string;
	    image?: string;
	    created_at?: string;
	    updated_at?: string;
	
	    static createFrom(source: any = {}) {
	        return new PlaylistDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this._id = source["_id"];
	        this.name = source["name"];
	        this.description = source["description"];
	        this.owner = source["owner"];
	        this.type = source["type"];
	        this.content_source = source["content_source"];
	        this.revenue_sharing_model = source["revenue_sharing_model"];
	        this.revenue_cut_percentage = source["revenue_cut_percentage"];
	        this.songs = this.convertValues(source["songs"], Song);
	        this.url = source["url"];
	        this.image = source["image"];
	        this.created_at = source["created_at"];
	        this.updated_at = source["updated_at"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

