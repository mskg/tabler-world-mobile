From https://aur.archlinux.org/packages/ttf-dejavu-emojiless/

```
docker run -it archlinux /bin/bash

pacman -Sy
pacman -S git vi fakeroot binutils
pacman -S fontconfig fontforge xorg-fonts-encodings xorg-mkfontdir xorg-mkfontscale
pacman -S sudo
pacman -S openssh

useradd markus
mkdir /home/markus
chown markus /home/markus

sudo su - markus
git clone https://aur.archlinux.org/ttf-dejavu-emojiless.git
cd ttf-dejavu-emojiless
makepkg

exit
pacman -U /home/markus/ttf-dejavu-emojiless/ttf-dejavu-emojiless-2.37-1-any.pkg.tar.xz

cd /usr/share/fonts/TTF
tar cf DejaVu.tar *.ttf
scp DejaVu.tar xxx@yyy:~/DejaVu.tar
```
