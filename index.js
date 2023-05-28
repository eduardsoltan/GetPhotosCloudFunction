const mySql = require('mysql');

const db = mySql.createPool({
    host: '34.118.46.114',
    user: 'root',
    password: 'admin',
    database: 'test'
});

exports.myFunction = (req, res) => {
    const verifyQuery = 'select * from photos p join relationship r on p.id = r.photo_id join labels l on r.label_id = l.id where user = ?';
    let resultSet = [];

    const username = req.body?.username;

    if(username === undefined) {
        const err = { message: 'Bad request parameters' };

        res.status(400).send(err);
    }

    db.query(verifyQuery, [username], (err, result) => {
        if(err) {
            const err1 = { message: 'Error occured during retrivig data' };
            
            res.status(400).send(err1);
            return;
        }

        if(result.length === 0) {
            const err1 = { message: 'User not found' };

            res.status(400).send(err1);
            return;
        }

        result.forEach(result => { 
            const isPresent = resultSet.some(value => value.link === result.link);

            if (isPresent === false) {
                resultSet.push({
                    link: result.link,
                    labels: result.label
                });
            }
            else {
                resultSet = resultSet.map((value) => {
                    if (value.link === result.link) {
                        const newSet = {
                            link: value.link,
                            labels: value.labels + ',' + result.label
                        }
    
                        return newSet;
                    }
                    else {
                        return value;
                    }
                });
            }
        });

        const response = { history: resultSet };
        res.send(response);
    });
}