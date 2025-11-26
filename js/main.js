// 게임 데이터
// 각 게임 정보를 여기에 추가하세요
const games = [
    {
        id: 1,
        title: '여주고테트리스',
        student: '테스트',
        description: '생성형 인공지능을 활용하여 코드 작성',
        folder: 'game1'
    },
    {
        id: 2,
        title: '체스',
        student: '이호진',
        description: '게임에 대한 간단한 설명이 들어갑니다.',
        folder: 'game2'
    },
    {
        id: 3,
        title: '게임 제목 3',
        student: '학생 이름',
        description: '게임에 대한 간단한 설명이 들어갑니다.',
        folder: 'game3'
    },
    {
        id: 4,
        title: '게임 제목 4',
        student: '학생 이름',
        description: '게임에 대한 간단한 설명이 들어갑니다.',
        folder: 'game4'
    },
    {
        id: 5,
        title: '게임 제목 5',
        student: '학생 이름',
        description: '게임에 대한 간단한 설명이 들어갑니다.',
        folder: 'game5'
    },
    {
        id: 6,
        title: '게임 제목 6',
        student: '학생 이름',
        description: '게임에 대한 간단한 설명이 들어갑니다.',
        folder: 'game6'
    },
    {
        id: 7,
        title: '게임 제목 7',
        student: '학생 이름',
        description: '게임에 대한 간단한 설명이 들어갑니다.',
        folder: 'game7'
    },
    {
        id: 8,
        title: '게임 제목 8',
        student: '학생 이름',
        description: '게임에 대한 간단한 설명이 들어갑니다.',
        folder: 'game8'
    },
    {
        id: 9,
        title: '게임 제목 9',
        student: '학생 이름',
        description: '게임에 대한 간단한 설명이 들어갑니다.',
        folder: 'game9'
    },
    {
        id: 10,
        title: '게임 제목 10',
        student: '학생 이름',
        description: '게임에 대한 간단한 설명이 들어갑니다.',
        folder: 'game10'
    },
    {
        id: 11,
        title: '게임 제목 11',
        student: '학생 이름',
        description: '게임에 대한 간단한 설명이 들어갑니다.',
        folder: 'game11'
    },
    {
        id: 12,
        title: '게임 제목 12',
        student: '학생 이름',
        description: '게임에 대한 간단한 설명이 들어갑니다.',
        folder: 'game12'
    },
    {
        id: 13,
        title: '게임 제목 13',
        student: '학생 이름',
        description: '게임에 대한 간단한 설명이 들어갑니다.',
        folder: 'game13'
    },
    {
        id: 14,
        title: '게임 제목 14',
        student: '학생 이름',
        description: '게임에 대한 간단한 설명이 들어갑니다.',
        folder: 'game14'
    },
    {
        id: 15,
        title: '게임 제목 15',
        student: '학생 이름',
        description: '게임에 대한 간단한 설명이 들어갑니다.',
        folder: 'game15'
    },
    {
        id: 16,
        title: '게임 제목 16',
        student: '학생 이름',
        description: '게임에 대한 간단한 설명이 들어갑니다.',
        folder: 'game16'
    },
    {
        id: 17,
        title: '게임 제목 17',
        student: '학생 이름',
        description: '게임에 대한 간단한 설명이 들어갑니다.',
        folder: 'game17'
    }
];

// 썸네일 색상 배열
const colors = ['bg-blue', 'bg-purple', 'bg-pink', 'bg-yellow', 'bg-green', 'bg-orange'];

// 게임 카드 생성 함수
function createGameCard(game, index) {
    const colorClass = colors[index % colors.length];
    
    return `
        <div class="game-card">
            <div class="game-thumbnail ${colorClass}">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M6 5h2M8 3v2M16 5h2M18 3v2"></path>
                    <rect x="2" y="7" width="20" height="14" rx="2"></rect>
                    <path d="M6 11h.01M10 11h.01M6 15h.01M10 15h.01M14 11h6M14 15h6"></path>
                </svg>
                <div class="game-number">#${game.id}</div>
            </div>
            <div class="game-info">
                <h3 class="game-title">${game.title}</h3>
                <div class="game-student">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <span>${game.student}</span>
                </div>
                <p class="game-description">${game.description}</p>
                <button class="play-button" onclick="playGame('${game.folder}')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M6 5h2M8 3v2M16 5h2M18 3v2"></path>
                        <rect x="2" y="7" width="20" height="14" rx="2"></rect>
                        <path d="M6 11h.01M10 11h.01M6 15h.01M10 15h.01M14 11h6M14 15h6"></path>
                    </svg>
                    게임 플레이
                </button>
            </div>
        </div>
    `;
}

// 게임 렌더링 함수
function renderGames(gamesToRender) {
    const gamesGrid = document.getElementById('gamesGrid');
    const noResults = document.getElementById('noResults');
    
    if (gamesToRender.length === 0) {
        gamesGrid.innerHTML = '';
        noResults.style.display = 'block';
    } else {
        noResults.style.display = 'none';
        gamesGrid.innerHTML = gamesToRender
            .map((game, index) => createGameCard(game, index))
            .join('');
    }
}

// 검색 함수
function searchGames(searchTerm) {
    const filtered = games.filter(game => 
        game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.student.toLowerCase().includes(searchTerm.toLowerCase())
    );
    renderGames(filtered);
}

// 게임 플레이 함수
function playGame(folder) {
    window.location.href = `games/${folder}/index.html`;
}

// 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 모든 게임 렌더링
    renderGames(games);
    
    // 검색 이벤트 리스너
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', function(e) {
        searchGames(e.target.value);
    });
});

// 전역 함수로 등록 (HTML onclick에서 사용)
window.playGame = playGame;
