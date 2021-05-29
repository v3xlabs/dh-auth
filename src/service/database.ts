import { PartialUser, User } from "../types/user";
import { v4 as uuidv4 } from "uuid";
import { createConnection } from "typeorm";
import { SocialID } from "../types/social";

export async function setupDB() {
  const connection = await createConnection({
    type: "postgres",
    host: process.env.POSTGRES_HOST,
    port: 5432,
    database: "dogehouse",
    username: "postgres",
    password: process.env.POSTGRES_PASSWORD,
    synchronize: true,
    entities: [User, SocialID],
  });
}

/**
 * Fetch the user by its social_id
 * @param social_key 'Github' 'Discord' 'Google'
 * @param social_id '12345'
 * @param generator Called if no user exists
 * @returns 
 */
export async function dataFetchUser(
  social_key: string,
  social_id: string,
  generator: () => PartialUser,
): Promise<User> {
  let social = await SocialID.find({
    where: { social_id: social_id, type: social_key },
    relations: ["user"],
  });

  if (social.length == 0) {
    console.log("Creating new user");
    // Default User Profile
    let user = new User();

    const preset = generator();
    for (let key of Object.keys(preset)) {
      if (preset[key]) {
        user[key] = preset[key];
      }
    }

    user.avatar = user.avatar.substr(0, 200);
    user.bio = user.bio.substr(0, 200);
    user.username = user.bio.substr(0, 8);

    let social = new SocialID();
    social.social_id = social_id;
    social.type = social_key;
    social.user = user;
    social = await social.save();

    user.socials = [social];
    user = await user.save();

    return user;
  }

  console.log("User already exists");
  let user = social[0].user;

  if (user == null) {
    throw new Error("User does not exist");
  }

  return user;
}
