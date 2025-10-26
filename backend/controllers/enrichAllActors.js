const { sendError } = require("../utils/helper");
const Actor = require("../models/actor");

exports.enrichAllActors = async (req, res) => {
  const TMDB_API_KEY = process.env.TMDB_API_KEY;

  try {
    const actors = await Actor.find({ apiId: { $exists: true, $ne: null } });
    let updated = 0;

    for (const actor of actors) {
      const response = await fetch(
        `https://api.themoviedb.org/3/person/${actor.apiId}?api_key=${TMDB_API_KEY}&language=en-US`
      );
      const tmdbActor = await response.json();

      actor.about = tmdbActor.biography || actor.about;
      actor.birthday = tmdbActor.birthday
        ? new Date(tmdbActor.birthday)
        : actor.birthday;

      await actor.save();
      updated++;
      console.log("Updated: ", updated, "of: ", actors.length);

      // Задержка для лимитов API
      await new Promise((resolve) => setTimeout(resolve, 250));
    }

    res.json({ success: true, updated });
  } catch (error) {
    sendError(res, error.message);
  }
};
