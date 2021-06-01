import { BaseEntity, Column, Entity, Index, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn, Unique } from "typeorm";
import { SocialID } from "./social";

export abstract class PartialUser extends BaseEntity {
    
    /**
     * Username
     * This is changable by the end user and should not be used as an identifier.
     */
    @Column({type: 'varchar', length: 12})
    username: string = 'Anonymous';

    /**
     * User Avatar URL
     * This is changable by the end user and should not be used as an identifier.
     */
    @Column({type: 'varchar', length: 200})
    avatar: string;

    /**
     * Biography
     * This is changable by the end user and should not be used as an identifier.
     */
    @Column({type: 'varchar', length: 200})
    bio: string = 'Hello Dogehouse';
}

@Entity()
export class User extends PartialUser {

    /**
     * Identifier
     * This is the unique user identifier
     */
    @PrimaryGeneratedColumn('increment')
    id: number;

    /**
     * Socials
     * This is a list of platforms that the user is connected with
     */
     @OneToMany(() => SocialID, socialID => socialID.user)
     socials: SocialID[]
};