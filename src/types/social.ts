import { BaseEntity, Column, Entity, Index, ManyToOne, PrimaryColumn } from "typeorm";
import { User } from "./user";

@Entity()
export class SocialID extends BaseEntity {

    /**
     * Platform Name
     */
    @Index()
    @Column({ type: 'varchar', length: 10 })
    type: string;

    /**
     * Social Identifier
     */
    @PrimaryColumn({ type: 'varchar', length: 30 })
    social_id: string;

    /**
     * User
     */
    @ManyToOne(() => User, user => user.socials)
    user: User;
}