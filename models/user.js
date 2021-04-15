'use strict';
const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

/* 
    Setup the User Model
*/
module.exports = (sequelize) => {
    class User extends Model { }
    User.init({
        firstName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'A name is required'
                },
                notEmpty: {
                    msg: "Please provide a name"
                }
            }
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'A name is required'
                },
                notEmpty: {
                    msg: "Please provide a name"
                }
            }
        },
        emailAddress: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: {
                msg: "The email you entered already exists"
            },
            validate: {
                notNull: {
                    msg: 'An email is required'
                },
                notEmpty: {
                    msg: "Please provide an email"
                },
                isEmail: {
                    msg: "Please provide a valid email"
                }
            }
        },
        password: {
            type: DataTypes.VIRTUAL,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'A password is required'
                },
                notEmpty: {
                    msg: "Please provide a password"
                },
                len: {
                    args: [8, 20],
                    msg: "Password should be between 8-20 characters in length"

                }
            }
        },
        confirmedPassword: {
            type: DataTypes.STRING,
            allowNull: false,
            set(val) {
                if (val === this.password) {
                    const hashedPassword = bcrypt.hashSync(val, 10)
                    // Sequelize will call this setter and run the hash before persisting to DB
                    this.setDataValue('confirmedPassword', hashedPassword)
                }
            },
            validate: {
                notNull: {
                    msg: "Both passwords must match"
                }
            }
        }
    }, { sequelize });

    User.associate = (models) => {
        User.hasMany(models.Course, {
          as: 'student', // alias
          foreignKey: {
            fieldName: 'studentUserId',
            allowNull: false,
          },
        });
      };

    return User;
};