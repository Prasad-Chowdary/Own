

module.exports = (req, res, callBack) =>{
    if(! req.session.isLoggedIn){
        return res.redirect('/index');
    }

    callBack();
};