-- Inserindo roles
INSERT INTO roles (role_id, name, description) VALUES
  (1, 'Client', 'Usuário comum que pode apenas comprar jogos e acessar sua biblioteca.'),
  (2, 'Administrator', 'Usuário com acesso total ao sistema, incluindo gerenciamento de jogos, usuários e painel administrativo.');

-- Inserindo permissions
INSERT INTO permissions (permission_id, name, description) VALUES
  (1, 'add_game', 'Permite adicionar novos jogos ao sistema.'),
  (2, 'edit_game', 'Permite editar informações de jogos existentes.'),
  (3, 'delete_game', 'Permite excluir jogos do sistema.'),
  (4, 'add_user', 'Permite cadastrar novos usuários.'),
  (5, 'edit_user', 'Permite editar dados de usuários existentes.'),
  (6, 'delete_user', 'Permite excluir usuários do sistema.'),
  (7, 'access_admin_panel', 'Permite acessar o painel administrativo do sistema.');

-- Inserindo role_permissions (apenas Administrator tem todas as permissões)
INSERT INTO role_permissions (role_id, permission_id) VALUES
  (2, 1),
  (2, 2),
  (2, 3),
  (2, 4),
  (2, 5),
  (2, 6),
  (2, 7);

-- Inserindo users
INSERT INTO users (user_id, name, email, password_hash, role_id, created_at) VALUES
  (1, 'VHADM', 'VHADM@gmail.com', 'VHADM', 2, '2025-09-16 12:00:00'),
  (2, 'Lucas Silva', 'lucas.silva@gmail.com', 'lucas123', 1, '2025-09-16 12:05:00'),
  (3, 'Maria Oliveira', 'maria.oliveira@gmail.com', 'maria123', 1, '2025-09-16 12:10:00'),
  (4, 'Pedro Santos', 'pedro.santos@gmail.com', 'pedro123', 1, '2025-09-16 12:15:00'),
  (5, 'Ana Costa', 'ana.costa@gmail.com', 'ana123', 1, '2025-09-16 12:20:00');

INSERT INTO games (game_id, title, description, developer, price, image_path, release_date, size_gb) VALUES
  (1, 'Elden Ring', 'Um RPG de ação em mundo aberto desenvolvido pela FromSoftware, em colaboração com George R. R. Martin. O jogador explora as Terras Intermédias, enfrentando inimigos desafiadores, chefes colossais e revelando segredos em um mundo vasto e sombrio.', 'FromSoftware', 299.90, './imgs/1.jpeg', '2022-02-25', 60.00),
  (2, 'Far Cry 3', 'Um FPS ambientado em uma ilha tropical dominada por piratas e mercenários. O protagonista Jason Brody deve lutar para sobreviver e salvar seus amigos enquanto enfrenta o icônico vilão Vaas Montenegro.', 'Ubisoft', 79.90, './imgs/2.jpeg', '2012-11-29', 35.00),
  (3, 'Ghost Of Tsushima', 'A história de Jin Sakai, um samurai que precisa abandonar tradições para enfrentar a invasão mongol na ilha de Tsushima. Com belos cenários e combate fluido, o jogo mistura ação, stealth e narrativa cinematográfica.', 'Sucker Punch Productions', 249.90, './imgs/3.jpeg', '2020-07-17', 50.00),
  (4, 'God Of War', 'Kratos recomeça sua vida em terras nórdicas, guiando seu filho Atreus em uma jornada de autodescoberta. O jogo apresenta combates brutais, exploração intensa e uma história emocionante de pai e filho.', 'Santa Monica Studio', 149.90, './imgs/4.jpeg', '2018-04-20', 45.00),
  (5, 'God Of War Ragnarok', 'A sequência épica traz Kratos e Atreus enfrentando deuses nórdicos em meio ao apocalipse do Ragnarok. O jogo expande o universo, aprimora o combate e entrega uma das narrativas mais impactantes da saga.', 'Santa Monica Studio', 299.90, './imgs/5.jpeg', '2022-11-09', 55.00),
  (6, 'Hogwarts Legacy', 'Um RPG no universo de Harry Potter, ambientado no século XIX. O jogador cria seu próprio bruxo, participa de aulas em Hogwarts, explora locais icônicos e enfrenta ameaças mágicas em um mundo aberto imersivo.', 'Portkey Games', 259.90, './imgs/6.jpeg', '2023-02-10', 70.00),
  (7, 'Hollow Knight', 'Um metroidvania 2D aclamado pela crítica. O jogador explora o reino subterrâneo de Hallownest, enfrentando criaturas bizarras, desbloqueando habilidades e desvendando uma história enigmática em um estilo artístico único.', 'Team Cherry', 47.90, './imgs/7.jpeg', '2017-02-24', 1.50),
  (8, 'Dark Souls III', 'O último capítulo da trilogia Souls traz combates desafiadores, cenários góticos e inimigos brutais. O jogador deve superar dificuldades extremas em busca de restaurar ou extinguir a chama.', 'FromSoftware', 199.90, './imgs/8.jpeg', '2016-04-12', 25.00),
  (9, 'Resident Evil 4', 'O jogo de survival horror clássico em sua versão moderna. O jogador explora mansões sombrias, resolve enigmas e enfrenta criaturas assustadoras em uma experiência tensa e icônica.', 'Capcom', 149.90, './imgs/9.jpeg', '2002-03-22', 20.00),
  (10, 'Sekiro: Shadows Die Twice', 'Um jogo de ação da FromSoftware em que o jogador controla um shinobi em busca de vingança. Com combate preciso, foco em parry e exploração vertical, Sekiro oferece um dos desafios mais intensos da geração.', 'FromSoftware', 199.90, './imgs/10.jpeg', '2019-03-22', 28.00),
  (11, 'Stardew Valley', 'Um simulador de fazenda onde o jogador cultiva, cria animais, constrói relacionamentos e participa da comunidade local. Com pixel art charmosa e liberdade total, tornou-se um dos indies mais populares.', 'ConcernedApe', 24.90, './imgs/11.jpeg', '2016-02-26', 0.50),
  (12, 'Among Us', 'Um jogo multiplayer de dedução social. Tripulantes trabalham para completar tarefas em uma nave espacial, enquanto impostores tentam sabotá-los. Diversão garantida em grupo com muita estratégia e enganação.', 'InnerSloth', 10.90, './imgs/12.jpeg', '2018-06-15', 0.25),
  (13, 'Batman Arkham Knight', 'O Cavaleiro das Trevas enfrenta o Espantalho e novos inimigos em Gotham. O jogo combina combates fluidos, exploração no Batmóvel e narrativa sombria no ápice da série Arkham.', 'Rocksteady Studios', 99.90, './imgs/13.jpeg', '2015-06-23', 35.00),
  (14, 'Cyberpunk 2077', 'Um RPG futurista em mundo aberto, ambientado em Night City. O jogador assume o papel de V, personaliza suas habilidades e molda sua história em meio a corporações, gangues e tecnologia avançada.', 'CD Projekt Red', 199.90, './imgs/14.jpeg', '2020-12-10', 70.00),
  (15, 'Red Dead Redemption II', 'Uma jornada épica no Velho Oeste com Arthur Morgan e a gangue Van der Linde. O jogo mistura narrativa profunda, exploração em mundo aberto e realismo impressionante.', 'Rockstar Games', 249.90, './imgs/15.jpeg', '2018-10-26', 105.00);

-- Inserindo categories
INSERT INTO categories (category_id, name, description) VALUES
  (1, 'RPG', 'Jogos de role-playing, com narrativa e evolução de personagem.'),
  (2, 'Action-Adventure', 'Jogos de ação com exploração e narrativa.'),
  (3, 'FPS', 'Jogos de tiro em primeira pessoa.'),
  (4, 'Metroidvania', 'Jogos de plataforma 2D com exploração interligada.'),
  (5, 'Survival Horror', 'Jogos de horror e sobrevivência.'),
  (6, 'Simulation', 'Jogos simuladores de vida, agricultura, etc.'),
  (7, 'Party Game', 'Jogos multiplayer focados em diversão em grupo.');

-- Inserindo game_categories
INSERT INTO game_categories (game_id, category_id) VALUES
  (1, 1),
  (1, 2),
  (2, 3),
  (3, 2),
  (3, 1),
  (4, 2),
  (5, 2),
  (5, 1),
  (6, 1),
  (7, 4),
  (8, 1),
  (9, 5),
  (10, 2),
  (11, 6),
  (12, 7),
  (13, 2),
  (14, 1),
  (15, 2);

INSERT INTO home_slider (slider_id, game_id, display_order) VALUES
  (1, 1, 1),
  (2, 5, 2),
  (3, 6, 3),
  (4, 14, 4),
  (5, 15, 5);

INSERT INTO library (user_id, game_id, added_at) VALUES
  (1, 1, '2025-09-16 12:30:00'),
  (1, 5, '2025-09-16 12:31:00'),
  (1, 6, '2025-09-16 12:32:00'),
  (1, 15, '2025-09-16 12:33:00');

INSERT INTO game_details (game_id, min_requirements, recommended_requirements) VALUES
  (1, 'Windows 10, i5-8400, 12GB RAM, GTX 1070', 'Windows 10, i7-8700K, 16GB RAM, RTX 2070'),
  (2, 'Windows 7, i3-2100, 4GB RAM, GTX 460', 'Windows 10, i5-2500K, 8GB RAM, GTX 770'),
  (3, 'Windows 10, i5-8400, 8GB RAM, GTX 970', 'Windows 10, i7-8700K, 16GB RAM, RTX 2070'),
  (4, 'Windows 8, i5-2400, 8GB RAM, GTX 660', 'Windows 10, i7-3770, 16GB RAM, GTX 1070'),
  (5, 'Windows 10, i5-2500K, 8GB RAM, GTX 970', 'Windows 10, i7-3770, 16GB RAM, RTX 2070'),
  (6, 'Windows 10, i5-8400, 8GB RAM, GTX 1060', 'Windows 10, i7-8700K, 16GB RAM, RTX 2070'),
  (7, 'Windows 7, i3-2100, 4GB RAM, GTX 560', 'Windows 10, i5-2500K, 8GB RAM, GTX 970'),
  (8, 'Windows 7, i5-2500, 4GB RAM, GTX 660', 'Windows 10, i5-4690K, 8GB RAM, GTX 970'),
  (9, 'Windows XP, Pentium 4, 2GB RAM, Geforce 6600', 'Windows 10, i5-2400, 8GB RAM, GTX 660'),
  (10, 'Windows 10, i5-8400, 8GB RAM, GTX 970', 'Windows 10, i7-8700K, 16GB RAM, RTX 2070'),
  (11, 'Windows 7, i3-2100, 2GB RAM, Intel HD 4000', 'Windows 10, i5-2400, 4GB RAM, GTX 650'),
  (12, 'Windows 7, i3-2100, 2GB RAM, Intel HD 4000', 'Windows 10, i5-2400, 4GB RAM, GTX 650'),
  (13, 'Windows 7, i5-2400, 8GB RAM, GTX 660', 'Windows 10, i7-3770, 16GB RAM, GTX 970'),
  (14, 'Windows 10, i5-8400, 12GB RAM, GTX 1060', 'Windows 10, i7-8700K, 16GB RAM, RTX 2070'),
  (15, 'Windows 10, i5-2500K, 8GB RAM, GTX 970', 'Windows 10, i7-3770, 16GB RAM, RTX 2070');

-- Cria um carrinho para o usuário admin (VHADM)
INSERT INTO carts (user_id) VALUES (1);

INSERT INTO cart_items (cart_id, game_id, quantity) VALUES (1, 2, 1);
INSERT INTO cart_items (cart_id, game_id, quantity) VALUES (1, 4, 1);