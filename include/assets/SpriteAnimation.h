#ifndef ANIMATION_H
#define ANIMATION_H

#include "types/Manager.h"
#include "assets/TexturePacker.h"

namespace grynca {

    // fw
    class SpriteAnimations;

    class SpriteAnimationFrame {
    public:
        SpriteAnimationFrame(const std::string& image_path, f32 time);

        const std::string& getImagePath()const;
        f32 getTime()const;
        const TextureRegion& getRegion()const;
        u32 getFrameId()const;

        void setTime(f32 time);
    private:
        friend class SpriteAnimation;

        std::string image_path_;
        TextureRegion region_;
        f32 time_;
        u32 frame_id_;
    };

    class SpriteAnimation : public ManagedItem<SpriteAnimations> {
    public:
        SpriteAnimation();
        SpriteAnimation& setFrames(const fast_vector<SpriteAnimationFrame>& frames);


        u32 getFramesCount()const;
        const SpriteAnimationFrame& getFrame(u32 frame_id)const ;
        SpriteAnimationFrame& accFrame(u32 frame_id);
    private:

        fast_vector<SpriteAnimationFrame> frames_;
    };

}


#include "SpriteAnimation.inl"
#endif //ANIMATION_H
