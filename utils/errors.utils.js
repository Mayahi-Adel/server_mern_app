module.exports.signUpErrors = (err) => {
  let errors = { pseudo: "", email: "", password: "" };

  if (err.message.includes("pseudo"))
    errors.pseudo = "Pseudo invalide (min 3 caractères) ou déjà pris";
  if (err.message.includes("email")) errors.email = "Email incorrect";
  if (err.message.includes("password"))
    errors.password = "Le mot de passse doit faire 6 caractères minimum";
  if (err.code === 11000 && err?.keyPattern?.email === 1)
    errors.email = "Cet email est dèjà enregistré";
  if (err.code === 11000 && err?.keyPattern?.pseudo === 1)
    errors.pseudo = "Ce pseudo est dèjà pris";

  return errors;
};

module.exports.signInErrors = (err) => {
  let errors = { email: "", password: "" };

  if (err.message.includes("email")) errors.email = "Email inconnu";
  if (err.message.includes("password"))
    errors.password = "Le mot de passe ne correspont pas";
  return errors;
};

module.exports.uploadErrors = (err) => {
  let errors = { format: "", maxSize: "" };
  if (err.message.includes("Invalid file"))
    errors.format = "Format incompatible";
  if (
    err.message.includes("max size") ||
    err.message.includes("File too large")
  )
    errors.maxSize = "Le fichier dépasse 500Ko";

  return errors;
};
