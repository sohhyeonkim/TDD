"use strict";
const createHashedPassword = require("../api/user/utils/createHashedPassword.js");

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    const password = "hello";
    const hashedPassword = await createHashedPassword(password);

    await queryInterface.bulkInsert("Users", [
      {
        userId: "test1",
        password: hashedPassword,
        nickname: "test1_nickname",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: "test2",
        password: hashedPassword,
        nickname: "test2_nickname",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete("Users", null, {});
  },
};
