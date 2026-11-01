const fs = require("fs")
const path = require("path")

const storyModel = require("../models/Story")

let isRunnig = false

setInterval(async () => {

    if (isRunnig) return;

    isRunnig = true

    try {
        const stories = await storyModel.find({ expireAt: { $lte: new Date() } })
        .select("_id media")
        .limit(100);

        if (!stories.length) return;

        for (const story of stories) {
            if (story.media?.path) {
                const filePath = path.join(process.cwd(), "public", story.media.path);

                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath)
                }
            }

            await storyModel.findByIdAndDelete(story._id)
        }
    } catch (err) {
        console.log("Story cleanup error: ", err);
    } finally {
        isRunnig = false
    }
}, 60 * 60 * 1000)