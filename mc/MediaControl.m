#include "MediaControl.h"
#import <Cocoa/Cocoa.h>
#import <MediaPlayer/MediaPlayer.h>

void UMC(const char *cSongName) {
    NSString *songName = [NSString stringWithUTF8String:cSongName];

    NSDictionary *info = @{
        MPMediaItemPropertyTitle: songName
    };

    MPNowPlayingInfoCenter *center = [MPNowPlayingInfoCenter defaultCenter];
    [center setNowPlayingInfo:info];

    // Check if info was set successfully
    if (center.nowPlayingInfo == info) {
        NSLog(@"Now Playing Info set successfully.");
    } else {
        NSLog(@"Failed to set Now Playing Info.");
    }
}
