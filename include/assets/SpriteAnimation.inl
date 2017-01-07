#include "SpriteAnimation.h"
#include "AssetsManager.h"
#include "assets/ImagesPack.h"

namespace grynca {

    inline SpriteAnimationFrame::SpriteAnimationFrame(const std::string& image_path, f32 time)
     : image_path_(image_path), time_(time), frame_id_(InvalidId())
    {
    }

    inline const std::string& SpriteAnimationFrame::getImagePath()const {
        return image_path_;
    }

    inline f32 SpriteAnimationFrame::getTime()const {
        return time_;
    }

    inline const TextureRegion& SpriteAnimationFrame::getRegion()const {
        return region_;
    }

    inline u32 SpriteAnimationFrame::getFrameId()const {
        return frame_id_;
    }

    inline void SpriteAnimationFrame::setTime(f32 time) {
        time_ = time;
    }

    inline SpriteAnimation::SpriteAnimation()
    {
    }

    inline SpriteAnimation& SpriteAnimation::setFrames(const fast_vector<SpriteAnimationFrame>& frames) {
        ASSERT_M(frames.size(), "SpriteAnimation must contain at least 1 frame.");
        frames_ = frames;
        for (u32 i=0; i<frames_.size(); ++i) {
            frames_[i].frame_id_ = i;
        }

        AssetsManager& mgr = getManager().getManager();

        // find pack where is first frame
        ImagesPack* pack = NULL;
        u32 j;
        for (j=0; j<mgr.getImagesPacks().getItemsCount(); ++j) {
            pack = mgr.getImagesPacks().getItemAtPos(j);
            if (!pack)
                continue;
            ImagesPack::Regions::const_iterator it = pack->getRegions().find(frames_[0].getImagePath());
            if (it!=pack->getRegions().end()) {
                frames_[0].region_ = it->second;
                break;
            }
        }

        ASSERT_M(j != mgr.getImagesPacks().getItemsCount(), "First animation frame not found.");

        // set regions for rest of the frames (must be in same pack)
        for (u32 i=1; i<frames_.size(); ++i) {
            ImagesPack::Regions::const_iterator it = pack->getRegions().find(frames_[i].getImagePath());
            ASSERT_M(it!=pack->getRegions().end(), "SpriteAnimation frame not found");
            frames_[i].region_ = it->second;
        }
        return *this;
    }

    inline u32 SpriteAnimation::getFramesCount()const {
        return u32(frames_.size());
    }

    inline SpriteAnimationFrame& SpriteAnimation::getFrame(u32 frame_id) {
        return frames_[frame_id];
    }
}