# NeighborhoodAssociationConnect
---

1. Clone
  SSH:
  ```bash
  git clone git@github.com:BPS-sys/NeighborhoodAssociationConnect.git
  ```
  
  or
  
  HTTPS:
  ```bash
  git clone https://github.com/BPS-sys/NeighborhoodAssociationConnect.git
  ```

2. Move
   ```bash
   cd NeighborhoodAssociationConnect/dev/backend/app/tools
   ```
3. Clone
   SSH:
   ```bash
   git clone git@github.com:BPS-sys/mcp-server-qdrant.git
   ```

   or


   HTTPS:
   ```bash
   git clone https://github.com/BPS-sys/mcp-server-qdrant.git
   ```

4. Move
   ```bash
   cd ../../../
   ```

5. Run
   ```bash
   docker compose build --no-cache
   docker compose up
   ```
