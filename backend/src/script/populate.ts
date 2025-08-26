import { populatePoints } from '@/services/populate_service';

(async () => {
  try {
    console.log('Iniciando importação de pontos...');
    await populatePoints();
    console.log('Banco populado com sucesso!');
    process.exit(0);
  } catch (err) {
    console.error('Erro ao popular o banco:', err);
    process.exit(1);
  }
})();
