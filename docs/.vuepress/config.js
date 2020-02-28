module.exports = {
  base:'/',
  title: 'CatLogBlog',
  description: 'Full Stack',
  themeConfig: {
    displayAllHeaders: true,
    nav: [
      { text:'关于我',link:'/about/'},
      {
        text: '分类',
        ariaLabel: 'Language Menu',
        items: [
          { text: '前端', items:[
            { text:'CSS',link:'/css/'},
            { text:'Js',link:'/javascript/'},
            { text:'Vue',link:'/vue/'},
            {text:'微信小程序开发',link:'/wxDev/'}            
          ] },
          { text: '服务器', items:[
            { text:'Node',link:'/node/'},
            { text:'Golang',link:'/golang/'},
            { text:'Docker',link:'/docker/'}            
          ] },
          { text: '其他', items:[
            { text:'工具',link:'/tools/'},
            { text:'开源项目',link:'/js/'},   
          ] },
        ]
      },
      {
        text:'Vue项目',
        link:'/project',
        target:'_blank'
      },
      {
        text:'Github',
        link:'http://www.github.com/BIXIAOJIE',
        target:'_blank'
      },
      
    ],
    sidebar:[
      '/',
      '/hello'
    ],
    sudevarDeoth:2,
    displayAllHeaders:true,
    serviceWorker: {
      updatePopup: true 
    }
  }
}