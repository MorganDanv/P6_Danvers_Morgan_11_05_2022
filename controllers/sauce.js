const Sauce = require("../models/sauce");
const fs = require("fs");

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });
  sauce
    .save()
    .then(() => res.status(201).json({ message: "Sauce crée !" }))
    .catch((error) => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id,
  })
    .then((sauce) => {
      res.status(200).json(sauce);
    })
    .catch((error) => {
      res.status(404).json({
        error: error,
      });
    });
};

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file
    ? {

        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };

  Sauce.findOne({ _id: req.params.id })
	.then((sauce) => {
		const filename = sauce.imageUrl.split("/images/")[1];
		fs.unlink(`images/${filename}`, () => {
			Sauce.updateOne(
			{ _id: req.params.id },
			{ ...sauceObject, _id: req.params.id }
		  )
			.then(() => res.status(200).json({ message: "Sauce modifiée !" }))
			.catch((error) => res.status(400).json({ error }));
		});
	})
	.catch((error) => res.status(500).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      const filename = sauce.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Sauce supprimée !" }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => {
      res.status(200).json(sauces);
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

exports.likeSauce = (req, res, next) => {
	Sauce.findOne({ _id: req.params.id })
	.then((sauce) => {
		if (req.body.like===1 && sauce.usersLiked.indexOf(req.body.userId)=== -1 && sauce.usersDisliked.indexOf(req.body.userId)=== -1 ) {
			Sauce.updateOne(
				{ _id: req.params.id },
				{
					$inc: { likes: 1 },
					$push: { usersLiked: req.body.userId },
					_id: req.params.id,
				}
			)
				.then(() => {
					res.status(200).json({
						message: "Sauce like",
					});
				})
				.catch((error) => {
					res.status(400).json({ error });
				});
		}else if (req.body.like === 0 && sauce.usersLiked.indexOf(req.body.userId) >=0 && sauce.usersDisliked.indexOf(req.body.userId)=== -1 ) {
			Sauce.updateOne(
				{ _id: req.params.id },
				{
					$inc: { likes: -1 },
					$pull: { usersLiked: req.body.userId },
					_id: req.params.id,
				}
			)
				.then(() => {
					res.status(200).json({
						message: "On retire le like",
					});
				})
				.catch((error) => {
					res.status(400).json({ error });
				});
		}else if (req.body.like === 0 && sauce.usersLiked.indexOf(req.body.userId) === -1 && sauce.usersDisliked.indexOf(req.body.userId) >= 0 ) {
			Sauce.updateOne(
				{ _id: req.params.id },
				{
					$inc: { dislikes: -1 },
					$pull: { usersDisliked: req.body.userId },
					_id: req.params.id,
				}
			)
				.then(() => {
					res.status(200).json({
						message: "On retire le Dislike",
					});
				})
				.catch((error) => {
					res.status(400).json({ error });
				});
		}else if (req.body.like===-1 && sauce.usersLiked.indexOf(req.body.userId)=== -1 && sauce.usersDisliked.indexOf(req.body.userId)=== -1 ) {
			Sauce.updateOne(
				{ _id: req.params.id },
				{
					$inc: { dislikes: 1 },
					$push: { usersDisliked: req.body.userId },
					_id: req.params.id,
				}
			)
				.then(() => {
					res.status(200).json({
						message: "Sauce dislike",
					});
				})
				.catch((error) => {
					res.status(400).json({ error });
				});
		}
	})
	.catch((error) => {
		res.status(400).json({ error });
	});
};	


