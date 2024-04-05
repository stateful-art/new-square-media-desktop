// Cynhyrchwyd y ffeil hon yn awtomatig. PEIDIWCH Â MODIWL
// This file is automatically generated. DO NOT EDIT
import {multimedia} from '../models';
import {context} from '../models';

export function CreateLibrary(arg1:multimedia.SongLibrary):Promise<void>;

export function GetLibrary(arg1:string):Promise<string>;

export function ListLibraries():Promise<Array<multimedia.SongLibrary>>;

export function ListLibrary(arg1:string,arg2:string):Promise<Array<multimedia.SongLibrary>>;

export function ListLibraryContents(arg1:string,arg2:string):Promise<Array<multimedia.SongLibrary>>;

export function OpenFileDialog():Promise<string>;

export function OpenFolderDialog():Promise<string>;

export function Startup(arg1:context.Context):Promise<void>;
