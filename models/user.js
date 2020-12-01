'use strict';
const bcrypt = require('bcrypt') // Making a hash password for user
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class user extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
        // define association here
        }
    };
    user.init({
        name: {
            type: DataTypes.STRING,
            validate: {
                len: {
                    args: [1,99],
                    msg: 'Name must be between 1 and 99 characters'
                }
            }
        },
        email: {
            type: DataTypes.STRING,
            validate: {
                isEmail: {
                    msg: 'Invalid email'
                }
            }
        },
        password: {
            type: DataTypes.STRING,
            validate: {
                len: {
                    args: [8,99],
                    msg: 'Password must be between 8 and 99 characters'
                }
            }
        }
    }, {
        sequelize,
        modelName: 'user',
    });
        user.addHook('beforeCreate', function(pendingUser) {
            // Bcrypt hashes a password
            let hash = bcrypt.hashSync(pendingUser.password, 12)
            // Set password to the hash
            pendingUser.password = hash
            console.log(pendingUser)
        })

        user.prototype.validPassword = function(passwordTyped) {
            // Compare what was typed with what is stored
            let correctPassword = bcrypt.compareSync(passwordTyped, this.password)
            console.log('Inside of validPassword', correctPassword)
            // Return true or false based on match
            return correctPassword
        }

        // Remove password before it gets serialized
        user.prototype.toJSON = function() {
            let userData = this.get()
            // Deletes password from request but not from database
            delete userData.password
            console.log(userData)
            // Return userData without the password typed in
            return userData
        }

    return user;
};