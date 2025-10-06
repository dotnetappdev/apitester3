# HTTP Monitoring - Quick Reference Card

## 🚀 Quick Start (30 seconds)

1. **Open Monitor:** Click `📡 Monitor` button in toolbar
2. **Configure:** Set port `8888` and endpoint `http://localhost:3000`
3. **Start:** Click `▶ Start Proxy`
4. **Use:** Set app proxy to `http://localhost:8888`
5. **Watch:** Traffic appears in real-time!

---

## 🎯 Key Features

| Feature | Description |
|---------|-------------|
| 🔍 **Intercept** | Capture all HTTP traffic |
| 👁️ **View** | Inspect headers and body |
| ✏️ **Modify** | Change responses before forwarding |
| ⚡ **Real-time** | Live traffic updates |
| 🎨 **Color-coded** | Easy method identification |

---

## 🎨 HTTP Method Colors

```
[GET]     Blue   - #61AFFE
[POST]    Green  - #49CC90
[PUT]     Orange - #FCA130
[DELETE]  Red    - #F93E3E
[PATCH]   Teal   - #50E3C2
```

---

## ⚙️ Configuration Options

| Option | Default | Description |
|--------|---------|-------------|
| Port | 8888 | Proxy listening port |
| Target Endpoints | localhost:3000 | Where to forward requests |
| Intercept | ✓ Enabled | Capture traffic |
| Auto-forward | ✗ Disabled | Manual/automatic mode |

---

## 🔑 Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Toggle Monitor | `Alt+M` (future) |
| Clear Traffic | `Alt+C` (future) |
| Start/Stop Proxy | `Alt+P` (future) |

---

## 📊 Understanding the Interface

### Left Panel: Traffic List
- Shows all captured requests
- Click to view details
- Color-coded method badges
- Status codes and timing

### Right Panel: Details
- **Request:** Headers, body, metadata
- **Response:** Status, headers, body
- **Metrics:** Time, size
- **Actions:** Modify response button

---

## 🛠️ Common Tasks

### Debug API Issue
1. Start monitoring
2. Reproduce issue in app
3. Find failing request
4. Inspect headers and body
5. Identify problem

### Test Error Handling
1. Disable auto-forward
2. Capture request
3. Modify response to error status
4. Send modified response
5. Verify app behavior

### Document API
1. Capture actual requests
2. Export request/response examples
3. Use for documentation

---

## ⚠️ Important Notes

❌ **Do Not Use:**
- With production systems
- With sensitive data
- Without HTTPS in production

✅ **Safe For:**
- Local development
- Testing and debugging
- API exploration
- Learning

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Proxy won't start | Try different port |
| No traffic | Check app proxy settings |
| Requests timeout | Enable auto-forward |
| Can't modify | Disable auto-forward |

---

## 💡 Pro Tips

1. **Start simple:** Use auto-forward initially
2. **Clear often:** Use 🗑️ Clear button regularly
3. **Target specific:** Add only needed endpoints
4. **Stop when done:** Free up the port
5. **Watch patterns:** Learn your API behavior

---

## 🎓 Learning Path

### Beginner
1. Start proxy with defaults
2. Capture simple GET requests
3. View headers and responses
4. Understand traffic flow

### Intermediate
1. Configure multiple endpoints
2. Modify simple responses
3. Test different status codes
4. Debug authentication issues

### Advanced
1. Manual mode with all requests
2. Complex response modifications
3. Performance analysis
4. Integration testing

---

## 📖 More Information

- **User Guide:** `docs/http-monitoring.html`
- **Technical Docs:** `HTTP_MONITORING_IMPLEMENTATION.md`
- **Visual Guide:** `HTTP_MONITORING_VISUAL_GUIDE.md`
- **UI Changes:** `UI_IMPROVEMENTS_SUMMARY.md`

---

## 🆘 Getting Help

1. Check troubleshooting section
2. Review documentation
3. Check GitHub issues
4. Ask in community

---

## 🎯 Success Checklist

Before first use:
- [ ] Read quick start guide
- [ ] Understand proxy concept
- [ ] Know your target endpoint
- [ ] Have test application ready
- [ ] Understand security warnings

After setup:
- [ ] Proxy starts successfully
- [ ] Application configured correctly
- [ ] Traffic appears in list
- [ ] Can view request details
- [ ] Can modify responses (optional)

---

## 📱 Status Indicators

| Indicator | Meaning |
|-----------|---------|
| ● Green pulsing | Proxy active |
| ○ Gray static | Proxy stopped |
| 🟢 200-299 | Success status |
| 🟡 300-399 | Redirect status |
| 🔴 400-499 | Client error |
| 🔴 500-599 | Server error |

---

## 🎨 UI Colors Reference

**Primary Actions:** Orange (#FF6C37)
**Success:** Green (#49CC90)
**Warning:** Orange (#FCA130)
**Error:** Red (#F93E3E)
**Info:** Blue (#61AFFE)

---

## 📏 Performance Tips

- Clear old traffic regularly
- Use specific endpoints, not catch-all
- Stop proxy when not in use
- Monitor memory usage with large traffic
- Consider request limits for long sessions

---

**Quick Access:** Toolbar → `📡 Monitor` or Sidebar → `📡 Monitoring`

**Status:** ✅ Ready to use!

---

*Palis v1.0.0 | HTTP Monitoring Feature*
*Inspired by HTTP Toolkit | Styled like Postman*
