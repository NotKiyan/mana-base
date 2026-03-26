import sequelize from './src/models/index.js';
import { CardFace } from './src/models/mtg.js';
async function check() {
    try {
        await sequelize.authenticate();
        const card_id = 'df2af646-3e5b-43a3-8f3e-50565889f456';
        const faces = await CardFace.findAll({ where: { card_id } });
        console.log('FACES COUNT:', faces.length);
        console.log('FACES:', JSON.stringify(faces, null, 2));
        process.exit(0);
    }
    catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
//# sourceMappingURL=check_faces.js.map