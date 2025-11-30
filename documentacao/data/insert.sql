-- Limpeza das tabelas na ordem correta para evitar conflitos de FK
TRUNCATE TABLE cart_items RESTART IDENTITY CASCADE;
TRUNCATE TABLE carts RESTART IDENTITY CASCADE;
TRUNCATE TABLE library RESTART IDENTITY CASCADE;
TRUNCATE TABLE home_slider RESTART IDENTITY CASCADE;
TRUNCATE TABLE game_details RESTART IDENTITY CASCADE;
TRUNCATE TABLE game_categories RESTART IDENTITY CASCADE;
TRUNCATE TABLE categories RESTART IDENTITY CASCADE;
TRUNCATE TABLE games RESTART IDENTITY CASCADE;
TRUNCATE TABLE users RESTART IDENTITY CASCADE;
TRUNCATE TABLE role_permissions RESTART IDENTITY CASCADE;
TRUNCATE TABLE permissions RESTART IDENTITY CASCADE;
TRUNCATE TABLE roles RESTART IDENTITY CASCADE;

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
  (7, 'access_admin_painel', 'Permite acessar o painel administrativo do sistema'),
  (8, 'delete_admin_user', 'Permite excluir usuários com role de administrador.'),
  (9, 'update_admin_user', 'Permite atualizar contas de administradores.'),
  (10, 'create_category', 'Criar categorias'),
  (11, 'edit_category', 'Editar categorias'),
  (12, 'delete_category', 'Deletar categorias'),
  (13, 'create_role', 'Permite criar roles'),
  (14, 'edit_role', 'Permite editar roles'),
  (15, 'delete_role', 'Permite deletar roles'),
  (16, 'create_game_details', 'Permite criar detalhes de jogos'),
  (17, 'edit_game_details', 'Permite editar detalhes de jogos'),
  (18, 'delete_game_details', 'Permite deletar detalhes de jogos'),
  (19, 'view_reports', 'Permite visualizar e exportar relatórios administrativos de vendas.');

-- Inserindo role_permissions (apenas Administrator tem todas as permissões)
INSERT INTO role_permissions (role_id, permission_id) VALUES
  (2, 1), (2, 2), (2, 3), (2, 4), (2, 5), (2, 6), (2, 7), (2, 8), (2, 9),
  (2, 10), (2, 11), (2, 12), (2, 13), (2, 14), (2, 15), (2, 16), (2, 17), (2, 18), (2, 19);

-- Inserindo users
INSERT INTO users (name, email, password_hash, role_id, created_at) VALUES
  ('VHADM', 'VHADM@gmail.com', '$2b$10$Ub8y.5mU5yxsJhknOyNmJ.7X8h9eFcejQpYhscAE2QfjP0WFl4s02', 2, '2025-09-16 12:00:00'),
  ('Lucas Silva', 'lucas.silva@gmail.com', '$2b$10$NXnxjZy8wn/iTv38o/IKJOQOWm1KRI.EU0YNZL161REgRMWT1aQwG', 1, '2025-09-16 12:05:00'),
  ('Maria Oliveira', 'maria.oliveira@gmail.com', '$2b$10$fTiCyo75MCv3xVWZAls8jOCap50RXtQUfbbGCiOhGsnP7CFOM0zhC', 1, '2025-09-16 12:10:00'),
  ('Pedro Santos', 'pedro.santos@gmail.com', '$2b$10$eccOTt/.KtMG1KrzvrSMKexs5Tw.oHcB7PSs4cJzROwsCAzgg4S9e', 1, '2025-09-16 12:15:00'),
  ('Ana Costa', 'ana.costa@gmail.com', '$2b$10$RfIw5mdkPZielwYnECzTWe42ete3MJwV/vEZNsl6RVpeMtTyoW7RK', 1, '2025-09-16 12:20:00');

INSERT INTO games (title, description, developer, price, image_path, release_date, size_gb) VALUES
  ('Elden Ring', 'Um RPG de ação em mundo aberto desenvolvido pela FromSoftware, em colaboração com George R. R. Martin. O jogador explora as Terras Intermédias, enfrentando inimigos desafiadores, chefes colossais e revelando segredos em um mundo vasto e sombrio.', 'FromSoftware', 299.90, './imgs/1.jpeg', '2022-02-25', 60.00),
  ('Far Cry 3', 'Um FPS ambientado em uma ilha tropical dominada por piratas e mercenários. O protagonista Jason Brody deve lutar para sobreviver e salvar seus amigos enquanto enfrenta o icônico vilão Vaas Montenegro.', 'Ubisoft', 79.90, './imgs/2.jpeg', '2012-11-29', 35.00),
  ('Ghost Of Tsushima', 'A história de Jin Sakai, um samurai que precisa abandonar tradições para enfrentar a invasão mongol na ilha de Tsushima. Com belos cenários e combate fluido, o jogo mistura ação, stealth e narrativa cinematográfica.', 'Sucker Punch Productions', 249.90, './imgs/3.jpeg', '2020-07-17', 50.00),
  ('God Of War', 'Kratos recomeça sua vida em terras nórdicas, guiando seu filho Atreus em uma jornada de autodescoberta. O jogo apresenta combates brutais, exploração intensa e uma história emocionante de pai e filho.', 'Santa Monica Studio', 149.90, './imgs/4.jpeg', '2018-04-20', 45.00),
  ('God Of War Ragnarok', 'A sequência épica traz Kratos e Atreus enfrentando deuses nórdicos em meio ao apocalipse do Ragnarok. O jogo expande o universo, aprimora o combate e entrega uma das narrativas mais impactantes da saga.', 'Santa Monica Studio', 299.90, './imgs/5.jpeg', '2022-11-09', 55.00),
  ('Hogwarts Legacy', 'Um RPG no universo de Harry Potter, ambientado no século XIX. O jogador cria seu próprio bruxo, participa de aulas em Hogwarts, explora locais icônicos e enfrenta ameaças mágicas em um mundo aberto imersivo.', 'Portkey Games', 259.90, './imgs/6.jpeg', '2023-02-10', 70.00),
  ('Hollow Knight', 'Um metroidvania 2D aclamado pela crítica. O jogador explora o reino subterrâneo de Hallownest, enfrentando criaturas bizarras, desbloqueando habilidades e desvendando uma história enigmática em um estilo artístico único.', 'Team Cherry', 47.90, './imgs/7.jpeg', '2017-02-24', 1.50),
  ('Dark Souls III', 'O último capítulo da trilogia Souls traz combates desafiadores, cenários góticos e inimigos brutais. O jogador deve superar dificuldades extremas em busca de restaurar ou extinguir a chama.', 'FromSoftware', 199.90, './imgs/8.jpeg', '2016-04-12', 25.00),
  ('Resident Evil 4', 'O jogo de survival horror clássico em sua versão moderna. O jogador explora mansões sombrias, resolve enigmas e enfrenta criaturas assustadoras em uma experiência tensa e icônica.', 'Capcom', 149.90, './imgs/9.jpeg', '2002-03-22', 20.00),
  ('Sekiro: Shadows Die Twice', 'Um jogo de ação da FromSoftware em que o jogador controla um shinobi em busca de vingança. Com combate preciso, foco em parry e exploração vertical, Sekiro oferece um dos desafios mais intensos da geração.', 'FromSoftware', 199.90, './imgs/10.jpeg', '2019-03-22', 28.00),
  ('Stardew Valley', 'Um simulador de fazenda onde o jogador cultiva, cria animais, constrói relacionamentos e participa da comunidade local. Com pixel art charmosa e liberdade total, tornou-se um dos indies mais populares.', 'ConcernedApe', 24.90, './imgs/11.jpeg', '2016-02-26', 0.50),
  ('Among Us', 'Um jogo multiplayer de dedução social. Tripulantes trabalham para completar tarefas em uma nave espacial, enquanto impostores tentam sabotá-los. Diversão garantida em grupo com muita estratégia e enganação.', 'InnerSloth', 10.90, './imgs/12.jpeg', '2018-06-15', 0.25),
  ('Batman Arkham Knight', 'O Cavaleiro das Trevas enfrenta o Espantalho e novos inimigos em Gotham. O jogo combina combates fluidos, exploração no Batmóvel e narrativa sombria no ápice da série Arkham.', 'Rocksteady Studios', 99.90, './imgs/13.jpeg', '2015-06-23', 35.00),
  ('Cyberpunk 2077', 'Um RPG futurista em mundo aberto, ambientado em Night City. O jogador assume o papel de V, personaliza suas habilidades e molda sua história em meio a corporações, gangues e tecnologia avançada.', 'CD Projekt Red', 199.90, './imgs/14.jpeg', '2020-12-10', 70.00),
  ('Red Dead Redemption II', 'Uma jornada épica no Velho Oeste com Arthur Morgan e a gangue Van der Linde. O jogo mistura narrativa profunda, exploração em mundo aberto e realismo impressionante.', 'Rockstar Games', 249.90, './imgs/15.jpeg', '2018-10-26', 105.00);

-- Inserindo categories
INSERT INTO categories (name, description) VALUES
  ('RPG', 'Jogos de role-playing, com narrativa e evolução de personagem.'),
  ('Action-Adventure', 'Jogos de ação com exploração e narrativa.'),
  ('FPS', 'Jogos de tiro em primeira pessoa.'),
  ('Metroidvania', 'Jogos de plataforma 2D com exploração interligada.'),
  ('Survival Horror', 'Jogos de horror e sobrevivência.'),
  ('Simulation', 'Jogos simuladores de vida, agricultura, etc.'),
  ('Party Game', 'Jogos multiplayer focados em diversão em grupo.');

-- Inserindo game_categories (sem repetições, e só combinações válidas)
INSERT INTO game_categories (game_id, category_id) VALUES
  (1, 1), -- Elden Ring: RPG
  (1, 2), -- Elden Ring: Action-Adventure
  (2, 3), -- Far Cry 3: FPS
  (2, 2), -- Far Cry 3: Action-Adventure
  (3, 2), -- Ghost Of Tsushima: Action-Adventure
  (3, 1), -- Ghost Of Tsushima: RPG
  (4, 2), -- God Of War: Action-Adventure
  (4, 1), -- God Of War: RPG
  (5, 2), -- God Of War Ragnarok: Action-Adventure
  (5, 1), -- God Of War Ragnarok: RPG
  (5, 4), -- God Of War Ragnarok: Metroidvania
  (6, 1), -- Hogwarts Legacy: RPG
  (6, 3), -- Hogwarts Legacy: FPS
  (7, 4), -- Hollow Knight: Metroidvania
  (8, 1), -- Dark Souls III: RPG
  (9, 5), -- Resident Evil 4: Survival Horror
  (10, 2), -- Sekiro: Action-Adventure
  (11, 6), -- Stardew Valley: Simulation
  (12, 7), -- Among Us: Party Game
  (13, 2), -- Batman Arkham Knight: Action-Adventure
  (14, 1), -- Cyberpunk 2077: RPG
  (15, 2); -- Red Dead Redemption II: Action-Adventure

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

INSERT INTO carts (user_id) VALUES 
(1),
(2),
(3),
(4),
(5);

INSERT INTO cart_items (cart_id, game_id, quantity, paid) VALUES 
  (1, 2, 1, FALSE),
  (1, 4, 1, FALSE),
  (2, 1, 2, TRUE),
  (2, 3, 1, TRUE),
  (3, 5, 1, TRUE),
  (3, 6, 2, TRUE),
  (4, 1, 1, TRUE),
  (4, 2, 1, TRUE),
  (5, 4, 1, TRUE);