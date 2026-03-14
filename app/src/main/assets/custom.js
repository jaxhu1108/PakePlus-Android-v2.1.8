window.addEventListener("DOMContentLoaded",()=>{const t=document.createElement("script");t.src="https://www.googletagmanager.com/gtag/js?id=G-W5GKHM0893",t.async=!0,document.head.appendChild(t);const n=document.createElement("script");n.textContent="window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-W5GKHM0893');",document.body.appendChild(n)});// very important, if you don't know what it is, don't touch it
const hookClick = (e) => {
    const origin = e.target.closest('a')
    const isBaseTargetBlank = document.querySelector(
        'head base[target="_blank"]'
    )
    if (
        (origin && origin.href && origin.target === '_blank') ||
        (origin && origin.href && isBaseTargetBlank)
    ) {
        e.preventDefault()
        location.href = origin.href
    }
}

window.open = function (url, target, features) {
    location.href = url
}

document.addEventListener('click', hookClick, { capture: true })

// ============================================
// PakePlus 通知桥接 - 将网页通知转发到系统
// ============================================
(function() {
    const checkTauri = setInterval(() => {
        if (window.__TAURI__?.notification) {
            clearInterval(checkTauri)
            initBridge()
        }
    }, 100)

    async function initBridge() {
        const { isPermissionGranted, requestPermission, sendNotification, createChannel } = window.__TAURI__.notification
        
        // 请求权限
        let granted = await isPermissionGranted()
        if (!granted) {
            const permission = await requestPermission()
            granted = permission === 'granted'
        }
        
        console.log('PakePlus 通知权限:', granted ? '已授权' : '未授权')
        
        // 创建通知渠道
        try {
            await createChannel({
                id: 'schedule-alarm',
                name: '班表闹钟',
                description: '排班系统班表提醒',
                importance: 'high',
                vibration: true
            })
        } catch(e) {
            console.log('创建通知渠道失败:', e)
        }
        
        // 暴露桥接 API 给网页
        window.pakeBridge = {
            // 发送系统通知
            async notify(title, body, options = {}) {
                if (!granted) {
                    return { success: false, error: 'no_permission' }
                }
                try {
                    await sendNotification({ 
                        title, 
                        body, 
                        channelId: 'schedule-alarm',
                        ...options 
                    })
                    return { success: true }
                } catch(e) {
                    return { success: false, error: e.message }
                }
            },
            
            // 检查权限
            checkPermission: () => granted
        }
        
        console.log('PakePlus 桥接已就绪')
    }
})()